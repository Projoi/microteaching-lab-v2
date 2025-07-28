import { DataTypes, Model, CreationOptional } from "sequelize";
import { sequelize } from "."; // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda

class Video extends Model {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string;
  declare can_comment: boolean;
  declare can_watch: boolean;
  declare views: number;
  declare video_link: string;
  declare thumbnail: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Video.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description:{
        type: DataTypes.TEXT,
    },
    can_comment:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    can_watch:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    views:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    video_link: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    thumbnail: {
        type: DataTypes.TEXT,
    },
  },
  {
    tableName: "videos", 
    sequelize, 
    paranoid: true,
    timestamps: true,
  }
);



export default Video;