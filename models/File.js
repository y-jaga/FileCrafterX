module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define(
    "File",
    {
      fileId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      folderId: {
        type: DataTypes.UUID,
      },
      publicId: {
        type: DataTypes.STRING, //recieved from cloudinary response
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    { tableName: "files", timestamps: false }
  );

  File.associate = (models) => {
    File.belongsTo(models.Folder, { foreignKey: "folderId" });
  };

  return File;
};
