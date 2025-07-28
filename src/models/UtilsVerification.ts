import { DataTypes, Model, CreationOptional } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import Video from "./Video";

class Verification extends Model {
  declare id: CreationOptional<number>;
  declare email: string;
  declare verification_code: string;

  // createdAt can be undefined during creation
  declare createdAt: CreationOptional<Date>;
  // updatedAt can be undefined during creation
  declare updatedAt: CreationOptional<Date>;
}

Verification.init(
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
    verification_code:{
        type: DataTypes.STRING,
        allowNull: false
    },

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "utils_verification", // Nama tabel di database
    sequelize, // Instance Sequelize yang digunakan
  }
);

export default Verification;