const Car = require('../models/Car');
const AppError = require('../utils/AppError');

const getAllCars = async (query) => {
  // basic filtering implementation
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;

  const cars = await Car.find(filter).sort('-createdAt');
  return cars;
};

const getCarById = async (id) => {
  const car = await Car.findById(id);
  if (!car) throw new AppError('No car found with that ID', 404);
  return car;
};

const createCar = async (carData) => {
  const newCar = await Car.create(carData);
  return newCar;
};

const updateCar = async (id, updateData) => {
  const car = await Car.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
  if (!car) throw new AppError('No car found with that ID', 404);
  return car;
};

const deleteCar = async (id) => {
  const car = await Car.findByIdAndDelete(id);
  if (!car) throw new AppError('No car found with that ID', 404);
  return car;
};

module.exports = {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar
};