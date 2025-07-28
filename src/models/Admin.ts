import { DataTypes, Model, CreationOptional, HasManyAddAssociationMixin } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
import Video from "./Video";

class Admin extends Model {
  declare id: CreationOptional<number>;
  declare username: string;
  declare password: string;
  declare role: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare addVideos: HasManyAddAssociationMixin<Video, number>
}

Admin.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin"
    },
    password:{
      type: DataTypes.STRING,
      allowNull: false
    },
    role:{
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin"
    },

    // timestamps
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    tableName: "admins", // Nama tabel di database
    sequelize, // Instance Sequelize yang digunakan
  }
);

Admin.hasMany(Video, {
  sourceKey: 'id',
  as: 'videos',
  constraints:false,
})
Video.belongsTo(Admin,{
  targetKey: "id",
  constraints:false,
})


export default Admin;