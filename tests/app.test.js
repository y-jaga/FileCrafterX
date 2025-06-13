require("dotenv").config();
const request = require("supertest");
const path = require("path");
const fs = require("fs");
const { app } = require("../index");
const { sequelize, Folder, File } = require("../models");
const jwt = require("jsonwebtoken");
const { uploadToCloudinary } = require("../src/services/fileService");
const { removeFile } = require("../src/utils/utility");
const { cloudinaryDestroy } = require("../src/config/cloudinary");

jest.mock("../src/services/fileService", () => ({
  ...jest.requireActual("../src/services/fileService"),
  uploadToCloudinary: jest.fn(),
}));

jest.mock("../src/config/cloudinary", () => ({
  ...jest.requireActual("../src/config/cloudinary"),
  cloudinaryDestroy: jest.fn(),
}));

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Folder Controllers Tests", () => {
  let folderId;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const createdFolder = await Folder.create({
      name: "Project Docs - 2",
      type: "pdf",
      maxFileLimit: 15,
    });

    folderId = createdFolder.folderId;

    jest.clearAllMocks();
  });

  it("POST /folders/create, should create a new folder", async () => {
    const mockResponse = {
      name: "Project Docs",
      type: "pdf",
      maxFileLimit: 10,
    };

    const response = await request(app).post("/folders/create").send({
      name: "Project Docs",
      type: "pdf",
      maxFileLimit: 10,
    });

    expect(response.statusCode).toBe(201);

    expect(response.body.message).toEqual("Folder created successfully");
    expect(response.body.folder).toMatchObject(mockResponse);
    expect(response.body.folder).toHaveProperty("folderId");
  });

  it("POST /folders/create, should return 400 error if required field name is missing", async () => {
    const response = await request(app)
      .post("/folders/create")
      .send({ type: "pdf", maxFileLimit: 10 });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toEqual("folder name is required");
  });

  it("POST /folders/create, should return 500 for internal server error", async () => {
    const originalCreate = Folder.create;

    Folder.create = jest.fn().mockImplementation(() => {
      throw new Error("DB Error");
    });

    const response = await request(app)
      .post("/folders/create")
      .send({ name: "Error Folder", type: "pdf", maxFileLimit: 5 });

    expect(response.statusCode).toBe(500);

    expect(response.body.error).toEqual("DB Error");

    Folder.create = originalCreate;
  });

  it("PUT /folders/:folderId, should update a folder by id", async () => {
    const response = await request(app).put(`/folders/${folderId}`).send({
      name: "Updated Folder Name",
      maxFileLimit: 15,
    });

    expect(response.statusCode).toBe(200);

    expect(response.body.message).toEqual("Folder updated successfully");

    expect(response.body.folder).toMatchObject({
      name: "Updated Folder Name",
      type: "pdf",
      maxFileLimit: 15,
    });
  });

  it("PUT /folders/:folderId, should return error 400 if folderId does not exists", async () => {
    const response = await request(app)
      .put("/folders/04a1018b-5c2b-499a-b999-d4ae81abc1a6")
      .send({
        name: "Updated Folder Name",
        maxFileLimit: 15,
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.error).toEqual(
      "Invalid folderId: folder does not exists"
    );
  });

  it("DELETE /folders/:folderId, should delete a folder by folderId", async () => {
    const response = await request(app).delete(`/folders/${folderId}`);

    expect(response.statusCode).toBe(204);
  });

  it("GET /folders/:folderId, should get a folder by folderId", async () => {
    const response = await request(app).get(`/folders/${folderId}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.folders).toMatchObject({
      name: "Project Docs - 2",
      type: "pdf",
      maxFileLimit: 15,
    });
  });

  it("GET /folders, should return all folders", async () => {
    const response = await request(app).get("/folders");

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body.folders)).toBe(true);

    expect(response.body.folders.length).toBeGreaterThan(0);

    expect(response.body.folders[0]).toMatchObject({
      name: "Project Docs - 2",
      type: "pdf",
      maxFileLimit: 15,
    });
  });
});

describe("File controller tests", () => {
  let folderId;
  let fileId;

  beforeEach(async () => {
    await sequelize.sync({ force: true });

    const createdFolder = await Folder.create({
      name: "Project Docs - 2",
      type: "pdf",
      maxFileLimit: 15,
    });

    folderId = createdFolder.folderId;

    const createdFile = await File.create({
      folderId,
      publicId: "m4rdgwxw5chrambrscwf",
      name: "file1.pdf",
      type: "application/pdf",
      size: 10,
      description: "application description",
    });

    fileId = createdFile.fileId;

    jest.clearAllMocks();
  });

  it("POST /folder-files/:folderId/files, should create a file", async () => {
    const mockDecodedToken = {
      lesson: "cloudinaryUpload",
      iat: 1749553698,
      exp: 1749560898,
    };

    const mockResponse = {
      folderId,
      name: "file_to_upload.pdf",
      type: "application/pdf",
      size: 10,
      description: "Monthly new report",
    };

    const mockCloudinaryResponse = {
      asset_id: "ca04f99f5e38adf3c8bffb3b42080f28",
      public_id: "sdaakoymxw8mz2goa2l7",
      version: 1749553864,
      version_id: "f45dbaa876545804d875271cf31ead2b",
      signature: "87d1422a0feadc4720285b194bf559a1fb13cf13",
      width: 1126,
      height: 797,
      format: "pdf",
      resource_type: "image",
      created_at: "2025-06-10T11:11:04Z",
      tags: [],
      bytes: 174744,
      type: "upload",
      etag: "12e1e9f8fad5b844733f3d9fda55a080",
      placeholder: false,
      url: "http://res.cloudinary.com/dwzmkzzw6/image/upload/v1749553864/sdaakoymxw8mz2goa2l7.png",
      secure_url:
        "https://res.cloudinary.com/dwzmkzzw6/image/upload/v1749553864/sdaakoymxw8mz2goa2l7.png",
      asset_folder: "",
      display_name: "sdaakoymxw8mz2goa2l7",
      original_filename: "1749553858247",
      api_key: "587866885867884",
    };

    //create a mock file to upload in uploads folder
    const dummyFilePath = path.resolve("uploads/file_to_upload.pdf");
    fs.writeFileSync(dummyFilePath, "dummy data");

    //mock file data to pass in request body
    const mockFileData = {
      file: "file_to_upload.pdf",
      description: "Monthly new report",
    };

    //similar to mockImplementation
    jwt.verify = jest.fn((token, secret, cb) => {
      cb(null, mockDecodedToken);
    });

    uploadToCloudinary.mockImplementation((file) => {
      //remove uploaded file after uploading it to cloudinary
      removeFile(file.path);

      return mockCloudinaryResponse;
    });

    const response = await request(app)
      .post(`/folder-files/${folderId}/files`)
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZXNzb24iOiJjbG91ZGluYXJ5VXBsb2FkIiwiaWF0IjoxNzQ5NTUzNjk4LCJleHAiOjE3NDk1NjA4OTh9.azzsZbw-CHyp5r5nPNbFAEUBlCCUW89lDw3GRIYA8ZI"
      )
      .attach("files", dummyFilePath)
      .field("data", JSON.stringify(mockFileData));

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toEqual("File uploaded successfully");
    expect(response.body.file).toMatchObject(mockResponse);

    //remove dummy file from uploads folder
    fs.unlinkSync(dummyFilePath);
  });

  it("PUT /folder-files/:folderId/files/:fileId, should update a file description", async () => {
    const response = await request(app)
      .put(`/folder-files/${folderId}/files/${fileId}`)
      .send({
        description: "Updated description for the file",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.message).toEqual(
      "File description updated successfully"
    );
  });

  it("DELETE /folder-files/:folderId/files/:fileId, should delete a file by fileId", async () => {
    cloudinaryDestroy.mockImplementation();

    const response = await request(app).delete(
      `/folder-files/${folderId}/files/${fileId}`
    );

    expect(response.statusCode).toBe(204);
  });

  it("DELETE /folder-files/:folderId/files/:fileId, should return error 404 if file doesn't exists in the specified folder.", async () => {
    File.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app).delete(
      `/folder-files/${folderId}/files/${fileId}`
    );

    expect(response.statusCode).toBe(404);

    expect(response.body.error).toEqual(
      "File does not exists in the specified folder."
    );
  });

  it("GET /folder-files/:folderId/files, should get files from a folder", async () => {
    const mockResponse = {
      folderId,
      publicId: "m4rdgwxw5chrambrscwf",
      name: "file1.pdf",
      type: "application/pdf",
      size: 10,
      description: "application description",
    };
    const response = await request(app).get(`/folder-files/${folderId}/files`);

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body.files)).toBe(true);

    expect(response.body.files[0]).toMatchObject(mockResponse);
  });

  it("GET /folder-files/:folderId/filesBySort, should sort files by size", async () => {
    await File.bulkCreate([
      {
        folderId,
        publicId: "m4rdgwxw5chrambrscwk",
        name: "file2.pdf",
        type: "application/pdf",
        size: 15,
        description: "file2 description",
      },
      {
        folderId,
        publicId: "g4rdgwxw5chrambrscwk",
        name: "file3.csv",
        type: "application/pdf",
        size: 5,
        description: "file3 description",
      },
    ]);

    const response = await request(app).get(
      `/folder-files/${folderId}/filesBySort?sort=size`
    );

    //takes sizes creates its copy, sort the copy, then compare original and copy.
    const sizes = response.body.files.map((file) => file.size);
    const sortedSizes = [...sizes].sort((size1, size2) => size1 - size2);

    expect(JSON.stringify(sortedSizes)).toEqual(JSON.stringify(sizes));
    expect(response.statusCode).toBe(200);
  });

  it("GET /folder-files/:folderId/filesBySort, should sort files by uploadedAt", async () => {
    await File.bulkCreate([
      {
        folderId,
        publicId: "m4rdgwxw5chrambrscwk",
        name: "file2.pdf",
        type: "application/pdf",
        size: 15,
        description: "file2 description",
      },
      {
        folderId,
        publicId: "g4rdgwxw5chrambrscwk",
        name: "file3.csv",
        type: "application/pdf",
        size: 5,
        description: "file3 description",
      },
    ]);

    const response = await request(app).get(
      `/folder-files/${folderId}/filesBySort?sort=uploadedAt`
    );

    const uploadedAt = response.body.files.map((file) => file.uploadedAt);
    const sortedUploadedAt = [...uploadedAt].sort();

    expect(JSON.stringify(uploadedAt)).toEqual(
      JSON.stringify(sortedUploadedAt)
    );
    expect(response.statusCode).toBe(200);
  });

  it("GET /folder-files/files/by-type?type=pdf, should get files by type", async () => {
    await File.bulkCreate([
      {
        folderId,
        publicId: "m4rdgwxw5chrambrscwk",
        name: "file2.pdf",
        type: "application/pdf",
        size: 15,
        description: "file2 description",
      },
      {
        folderId,
        publicId: "g4rdgwxw5chrambrscwk",
        name: "file3.csv",
        type: "application/pdf",
        size: 5,
        description: "file3 description",
      },
    ]);

    const response = await request(app).get(
      `/folder-files/files/by-type?type=pdf`
    );

    const fileTypes = response.body.files.map((file) => file.type);

    console.log(fileTypes);

    expect(response.statusCode).toBe(200);

    expect(response.body.files[0]).toMatchObject({
      publicId: "m4rdgwxw5chrambrscwf",
      name: "file1.pdf",
      type: "application/pdf",
      size: 10,
      description: "application description",
    });

    expect(fileTypes.every((type) => type === "application/pdf")).toBe(true);
  });

  it("GET /folder-files/:folderId/metadata, should get files by data", async () => {
    const mockResponse = [
      {
        fileId: fileId,
        name: "file1.pdf",
        size: 10,
        description: "application description",
      },
    ];

    const response = await request(app).get(
      `/folder-files/${folderId}/metadata`
    );

    expect(response.statusCode).toBe(200);

    expect(response.body.files).toEqual(mockResponse);
  });
});
