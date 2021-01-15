export class CommonUtils {
  public static send(res: any, code: number, item?) {
    res.status(code);
    if (item) {
      typeof item === "string" ? res.send(item) : res.json(item);
    }
  }

  public static convertToIdArray(array: any[]) {
    return array.map(this.convertToId);
  }

  public static convertToId(item: { _id?: string; [key: string]: any }) {
    item.id = item._id;
    delete item._id;
    return item;
  }

  public static getIdForMongo(item: { id?: string; [key: string]: any }) {
    const id = item.id;
    delete item.id;
    return id;
  }
}
