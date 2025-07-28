import { DataTypes, Model, CreationOptional } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda

class Comment extends Model {
  declare id: CreationOptional<number>;
  declare content: string;
  declare student_id: string;
  declare student_email: string;
  declare video_id: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    student_email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    video_id: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "comments", // Nama tabel di database
    sequelize, // Instance Sequelize yang digunakan
  }
);




export default Comment;