import mongodb from "mongodb";

export class DbUtils {
  static client;

  public static async connect(url) {
    if (!this.client) {
      mongodb.MongoClient.connect(url, (err, dbClient) => {
        if (err) {
          throw err;
        }
        this.client = dbClient;
      });
    }
  }

  public static getDbClient() {
    return this.client;
  }
}
