import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://EstanciaDigital:IlDCWNEvVYJ0nO4X@cluster0.qumrscp.mongodb.net/?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error(
    'Por favor define la variable de entorno MONGODB_URI en tu archivo .env.local'
  );
}

let cached: any = null;

async function connectDB() {
  if (cached) {
    return cached;
  }

  try {
    const opts = {
      bufferCommands: false,
    };

    cached = await mongoose.connect(MONGODB_URI, opts);
    return cached;
  } catch (error) {
    cached = null;
    throw error;
  }
}

export default connectDB;