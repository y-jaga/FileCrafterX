# 📂 FileCrafterX - API-based Document Management System

# 🚀 Project Overview

FileCrafterX is a powerful and scalable API-based Document Management System that allows users to:

- 📁 Create folders with restrictions (file type, max file limit)

- 📤 Upload files with metadata to Cloudinary

- 🛡 Implemented JWT authentication so that only authenticated user can upload a file.

- 🔄 Manage files and folders (delete, update, and read operations)

- 🔍 Sort files by size or upload date

- 📄 Retrieve files by type across folders

- 🏷 Fetch file metadata for better insights

# 🛠 Tech Stack:

- 🟢 Node.js & Express.js – Backend framework

- ☁️ Cloudinary – File storage

- 📦 Multer – Middleware for file uploads

- 🗄 Sequelize – ORM for PostgreSQL

- 🛢 Supabase PostgreSQL – Database

- 🛡 JWT Authentication

# 🔗 API Endpoints

## 📂 Folder Management

### ➕ Create a Folder

#### Description: Creates a new folder with optional restrictions.

#### Endpoint: POST /folders/create

#### Request Payload: 
``` 
{
  "name": "Project Docs",
  "type": "pdf",
  "maxFileLimit": 10
}
``` 

#### Expected Reponse:
``` 
{ 
   "message": "Folder created successfully", 
   "folder": { 
         "folderId": "FOLDER_ID_UUID_FORMAT", 
         "name": "Project Docs", 
         "type": "pdf", 
         "maxFileLimit": 10 
      } 
   } 
```



---

### ✏️ Update a Folder

#### Description: Updates folder metadata.

#### Endpoint: PUT /folders/:folderId

#### Request Payload: 
``` 
{
  "name": "Updated Folder Name",
  "maxFileLimit": 15
}  
```

#### Expected Reponse:
```
{
  'message': 'Folder updated successfully',
  'folder': {
    'folderId': 'FOLDER_ID_UUID_FORMAT',
    'name': 'Updated Folder Name',
    'type': 'csv',
    'maxFileLimit': 15
  }
}
```

---

### 🗑 Delete a Folder

#### Endpoint: DELETE /folders/:folderId

#### Description: Deletes a folder and all its files from Cloudinary as well as from database.

---

### 📜 Get All Folders

#### Endpoint: GET /folders

#### Description: Fetches a list of all folders.

#### Expected Response:
```
{
  "folders": [
    {
      "folderId": "FOLDER_ID_UUID_FORMAT",
      "name": "csv_folder",
      "type": "csv",
      "maxFileLimit": 5
    },
    {
      "folderId": "FOLDER_ID_UUID_FORMAT",
      "name": "pdf_folder",
      "type": "pdf",
      "maxFileLimit": 3
    },
    {
      "folderId": "FOLDER_ID_UUID_FORMAT",
      "name": "image_folder",
      "type": "img",
      "maxFileLimit": 3
    }
  ]
}
```

# 📄 File Management

## 📤 Upload a File

*** Important: Generate a jwt token by running ```node jwt.js``` in terminal then paste the generated token in Postman under Header > Authorization as ```Bearer <token>``` before making this request.

Upload file in postman under Body > form-data: ```file : <uploaded file> ``` and paste request payload as ```data : {request_payload_data} ```

### Endpoint: POST /folder-files/:folderId/files

Description: Uploads a file to Cloudinary using Multer and insert in database as well.

### Request Payload:
```
{
  'file': 'file_to_upload.csv',
  'description': 'Monthly budget report'
}
```

### Expected Response:
```
{
  'message': 'File uploaded successfully',
  'file': {
    'fileId': 'FILE_ID_UUID_FORMAT',
    'uploadedAt': '2024-11-13T08:23:59.443Z',
    'name': 'file_to_upload.csv',
    'type': 'application/csv',
    'size': 60146,
    'folderId': 'FOLDER_ID_UUID_FORMAT',
    'description': 'Monthly new report'
  }
}
```
---

## 📝 Update File Description

#### Endpoint: PUT /folder-files/:folderId/files/:fileId
#### Description: Updates the description of a file.
#### Request Payload:
```
{
  'description': 'Updated description for the file'
}
```
#### Expected Response:
```
{
  'message': 'File description updated successfully',
  'files': {
    'fileId': 'FILE_ID_UUID_FORMAT',
    'description': 'Updated description for the file'
  }
}
```
---

## 🗑 Delete a File

#### Endpoint: DELETE /folder-files/:folderId/files/:fileId

#### Description: Deletes a file of a folder from Cloudinary and database.


---

## 📂 Get Files from a Folder

#### Endpoint: GET /folder-files/:folderId/files

#### Description: Retrieves all files within a specific folder.

#### Expected Response:
```
{
  "files": [
    {
      "fileId": "3a9f4aef-64a0-4b67-b582-86db466f4179",
      "folderId": "ccc7a763-7709-4161-8314-2b8423d7626f",
      "publicId": "m4rdgwxw5chrambrscwf",
      "name": "marwari_slogan.png",
      "description": "It is marwari slogan",
      "type": "image/png",
      "size": 2974419,
      "uploadedAt": "2025-06-08T07:36:19.295Z"
    },
    {
      "fileId": "028d9f82-5644-4405-8550-1572a9e8be8c",
      "folderId": "ccc7a763-7709-4161-8314-2b8423d7626f",
      "publicId": "twx6gbxc7pzng03rozfo",
      "name": "zenitsu-agatsuma.png",
      "description": "Thunder hashira",
      "type": "image/png",
      "size": 2552235,
      "uploadedAt": "2025-06-08T07:49:14.415Z"
    },
    {
      "fileId": "7ebae8f4-36d7-47f4-89e9-24ce21058d55",
      "folderId": "ccc7a763-7709-4161-8314-2b8423d7626f",
      "publicId": "w7mn9ytczzjyhkr6f2ib",
      "name": "java_dsa.png",
      "description": "It is a jawa dsa certificate",
      "type": "image/png",
      "size": 174744,
      "uploadedAt": "2025-06-08T07:53:15.696Z"
    }
  ]
}
```

---

## 🔄 Retrieve sorted files by size and recency(uploadedAt).

#### Endpoint: GET /folder-files/:folderId/filesBySort?sort=size or sort=uploadedAt

#### Description: Sorts files by size or recency.

---

## 🔍 Get Files by Type Across Folders

#### Endpoint: GET /files?type=pdf

#### Description: Fetches files of a specific type from all folders.

---

## 🏷 Get File Metadata

#### Endpoint: GET /folders/:folderId/files/metadata

#### Description: Retrieves metadata of files within a folder.

---

# ⚙️ Installation & Setup

 ### 📥 Clone the Repository
```
git clone https://github.com/y-jaga/FileCrafterX.git 
cd File-Crafter-X
```

 ### 📦 Install Dependencies

npm install

#### 🛠 Set Up Environment Variables
*Important: Generate JWT_SECRET bu running below command in terminal
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Create a .env file and add:
```
PORT = 3000

#CLOUDINARY CONFIG
CLOUDINARY_CLOUD_NAME = <YOUR_CLOUDINARY_CLOUD_NAME>
CLOUDINARY_API_KEY = <YOUR_CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET = <YOUR_CLOUDINARY_API_SECRET>

#SUPABASE CONFIG
DATABASE_URL = <YOUR_DATABASE_URL>
DB_USER = <YOUR_DATABASE_USER>
DB_NAME = <YOUR_DATABASE_NAME>
DB_PASSWORD = <YOUR_DATABASE_PASSWORD>
DB_HOST = <YOUR_DATABASE_HOST_NAME>

#JWT
JWT_SECRET = <YOUR_JWT_SECRET>
```
- ▶️ Run the Server
```
npm start
```
