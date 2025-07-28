"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const _1 = require("."); // Pastikan Anda mengganti path sesuai dengan struktur direktori Anda
class Video extends sequelize_1.Model {
}
Video.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
    },
    can_comment: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    can_watch: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    views: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0
    },
    video_link: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    thumbnail: {
        type: sequelize_1.DataTypes.TEXT,
    },
    // timestamps
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    tableName: "videos",
    sequelize: // Nama tabel di database
    _1.sequelize, // Instance Sequelize yang digunakan
});
exports.default = Video;
//# sourceMappingURL=Video.js.map