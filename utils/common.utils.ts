export class CommonUtils {
    public static send(res: any, code: number, item?) {
        res.status(code);
        if (item) {
          typeof item === "string" ? res.send(item) : res.json(item);
        }
      }

      public static  convertIdArray(array: any[]) {
        return array.map(this.convertId);
      }

      public static convertId(item: {_id?: string, [key: string]: any}) {
        item.id = item._id;
        delete item._id;
        return item;
      }
}