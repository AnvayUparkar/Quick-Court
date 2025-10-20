require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Facility = require('./models/Facility');
const Court = require('./models/Court');
const Booking = require('./models/Booking');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser: true, // Removed deprecated option
            // useUnifiedTopology: true, // Removed deprecated option
        });
        console.log('MongoDB Connected for Seeding...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();
    try {
        await User.deleteMany();
        await Facility.deleteMany();
        await Court.deleteMany();
        await Booking.deleteMany();

        // Hash passwords properly
        const adminPassword = await bcrypt.hash('Mahesh@1971', 10);
        const userPassword = await bcrypt.hash('Vineet@2005', 10);
        const ownerPassword = await bcrypt.hash('Anvay@2005', 10);

        // Use the hashed passwords when creating users
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'maheshbu@gmail.com',
            password: adminPassword, // Use hashed password
            role: 'admin',
            verified: true,
        });

        const regularUser = await User.create({
            name: 'Regular User',
            email: 'unrealtechtest@gmail.com',
            password: userPassword, // Use hashed password
            role: 'user',
            verified: true,
        });

        const facilityOwner = await User.create({
            name: 'Facility Owner',
            email: 'anvaymuparkar@gmail.com',
            password: ownerPassword, // Use hashed password
            role: 'facility_owner',
            verified: true,
        });

        const facility1 = await Facility.create({
            name: 'Sporting Club Arena',
            description: 'A multi-sport complex with state-of-the-art facilities.',
            location: {
                type: 'Point',
                coordinates: [-74.0060, 40.7128], // Example: Longitude, Latitude for New York City
                address: '123 Sports Lane, Sportsville'
            },
            sports: ['tennis', 'badminton', 'swimming'],
            amenities: ['parking', 'cafe', 'changing rooms'],
            photos: [`https://res.cloudinary.com/df3zt0ogz/image/upload/v1755878821/Arena-Sport-Club-Ugena-Toledo_2_xp45fs.webp`],
            ownerId: facilityOwner._id,
            approved: true,
        });

        await Facility.create({
            name: 'Downtown Courts',
            description: 'Prime courts in the heart of the city.',
            location: {
                type: 'Point',
                coordinates: [-73.935242, 40.730610], // Example: Longitude, Latitude for a different location
                address: '456 City Center, Metropolis'
            },
            sports: ['basketball', 'volleyball'],
            amenities: ['showers', 'lockers'],
            photos: [`https://res.cloudinary.com/df3zt0ogz/image/upload/v1755880297/Green-Meadows-Park-4_hnbibi.jpg`],
            ownerId: facilityOwner._id,
            approved: false, // Pending approval
        });

        const facility3 = await Facility.create({
            name: 'Green Meadows Sports Complex',
            description: 'A spacious complex with various outdoor and indoor courts.',
            location: {
                type: 'Point',
                coordinates: [-73.9878, 40.7580], // Example: Times Square, NYC
                address: '789 Green Lane, Meadowville'
            },
            sports: ['soccer', 'volleyball', 'badminton'],
            amenities: ['parking', 'locker rooms', 'snack bar'],
            photos: [`https://res.cloudinary.com/df3zt0ogz/image/upload/v1755880297/Green-Meadows-Park-4_hnbibi.jpg`],
            ownerId: facilityOwner._id,
            approved: true,
        });

        const court1 = await Court.create({
            facilityId: facility1._id,
            name: 'Tennis Court 1',
            sportType: 'tennis',
            pricePerHour: 25,
            operatingHours: { start: '08:00', end: '22:00' },
            slots: [
                { date: new Date(new Date().setHours(0, 0, 0, 0)), time: '10:00', isBooked: false },
                { date: new Date(new Date().setHours(0, 0, 0, 0)), time: '11:00', isBooked: false },
                { date: new Date(new Date().setHours(0, 0, 0, 0)), time: '21:00', isBooked: false },
                { date: new Date(new Date().setHours(0, 0, 0, 0)), time: '22:00', isBooked: false },
            ]
        });

        const court2 = await Court.create({
            facilityId: facility1._id,
            name: 'Badminton Court 3',
            sportType: 'badminton',
            pricePerHour: 15,
            operatingHours: { start: '09:00', end: '21:00' },
            slots: [
                { date: new Date(new Date().setHours(0, 0, 0, 0)), time: '14:00', isBooked: true, bookedBy: regularUser._id },
            ]
        });

        facility1.courts.push(court1._id, court2._id);
        await facility1.save();

        const booking1 = await Booking.create({
            userId: regularUser._id,
            facilityId: facility1._id,
            courtId: court2._id,
            date: new Date(new Date().setHours(0, 0, 0, 0)),
            timeSlot: '14:00',
            status: 'confirmed',
        });

        regularUser.bookings.push(booking1._id);
        await regularUser.save();

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    await connectDB();
    try {
        await User.deleteMany();
        await Facility.deleteMany();
        await Court.deleteMany();
        await Booking.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}