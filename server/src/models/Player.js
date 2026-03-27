import { DataTypes } from 'sequelize';

export const definePlayer = (sequelize) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    limitlessPlayerId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
  }, {
    tableName: 'players',
  });

  return Player;
};
