// MongoDB connection with Atlas options
await mongoose.connect(process.env.MONGODB_URI, {
  // These options are recommended for MongoDB Atlas
  retryWrites: true,
  w: 'majority',
  // Add SSL if your cluster requires it
  // ssl: true,
  // sslValidate: true,
}); 

const startApp = async () => {
    try {
        await connectDB();
        app.listen(3002, () => { 
            console.log(`Server is running on port 3002`);
        });
    } catch (error) {
        console.log(error);
    }
}; 