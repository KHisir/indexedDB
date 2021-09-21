import { IndexedDBIndex } from "./cc-indexedDBIndex";

export class IndexedDBStore {
  public Name: string;
  public PrimaryKey: string;
  public AutoIncrement: boolean;
  public Indexes: IndexedDBIndex[];

  constructor(
    name: string,
    primaryKey: string = '',
    autoIncrement: boolean = true,
    indexes: IndexedDBIndex[] = []
  ) {
      this.Name = name;
      this.PrimaryKey = primaryKey;
      this.AutoIncrement = autoIncrement;
      this.Indexes = indexes;
  }
}
