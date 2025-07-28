import { DataTypes, Model, CreationOptional } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import Video from "./Video";

class Student extends Model {
  declare id: CreationOptional<number>;
  declare email: string;
  declare password: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "students", // Nama tabel di database
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default Student;