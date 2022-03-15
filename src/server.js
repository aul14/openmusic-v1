// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

//import nilai albums plugin dan AlbumsService
const Hapi = require('@hapi/hapi');

//albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');


const init = async () => {
  //buat instance dari AlbumsService dengan nama albumsService
  const albumsService = new AlbumsService(); 
  const songsService = new SongsService(); 
  /** daftarkan plugin albums dengan options.service bernilai albumsService menggunakan 
   * perintah await server.register tepat sebelum kode await server.start() */

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
 
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator
      }
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    if (response instanceof ClientError) {
      const clientErrorResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      clientErrorResponse.code(response.statusCode);
      return clientErrorResponse;
    }

    if (response.isServer) {
      // Server ERROR!
      const serverErrorResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      serverErrorResponse.code(serverErrorResponse.statusCode);
      return serverErrorResponse;
    }

    // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return response.continue || response;
  });
 
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
 
init();