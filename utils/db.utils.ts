import mongodb from "mongodb";

export class DbUtils {
  static database: mongodb.Db;

  public static async connect(url) {
    console.log('DB initial: ', this.database);
    if (!this.database) {
      mongodb.MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
          throw err;
        }
        console.log('Db initialised !');
        this.database = client.db();
      });
    }
  }

  public static getDB(): mongodb.Db {
    return this.database;
  }
}
