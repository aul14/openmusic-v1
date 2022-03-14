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
 
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
 
init();