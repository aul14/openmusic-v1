const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModel } = require('../../utils/songs');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    //fungsi create
    async addSong({ title, year, performer, genre, duration, album_id }) {
        const id = `song-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        //buat objek query untuk memasukan songs baru ke database
        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, Number(year), performer, genre, Number(duration), createdAt, updatedAt, album_id],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Song gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    //fungsi get all
    async getSongs() {
        const result = await this._pool.query('SELECT id, title, performer FROM songs');

        return result.rows.map(mapDBToModel);
    }

    //fungsi get ById
    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Song tidak ditemukan');
        }

        return result.rows.map(mapDBToModel)[0];
    }

    //fungsi edit song by id
    async editSongById(id, {title, year, performer, genre, duration, album_id}) {
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
            values: [title, Number(year), performer, genre, Number(duration), album_id, updatedAt, id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
        }
    }

    //fungsi delete by id
   async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;