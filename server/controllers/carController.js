const carService = require('../services/carService');
const catchAsync = require('../utils/catchAsync');

exports.getAllCars = catchAsync(async (req, res, next) => {
  const cars = await carService.getAllCars(req.query);
  res.status(200).json({
    success: true,
    results: cars.length,
    data: { cars }
  });
});

exports.getCar = catchAsync(async (req, res, next) => {
  const car = await carService.getCarById(req.params.id);
  res.status(200).json({
    success: true,
    data: { car }
  });
});

exports.createCar = catchAsync(async (req, res, next) => {
  const newCar = await carService.createCar(req.body);
  res.status(201).json({
    success: true,
    data: { car: newCar }
  });
});

exports.updateCar = catchAsync(async (req, res, next) => {
  const car = await carService.updateCar(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: { car }
  });
});

exports.deleteCar = catchAsync(async (req, res, next) => {
  await carService.deleteCar(req.params.id);
  res.status(204).json({
    success: true,
    data: null
  });
});
