export class IndexedDBIndex {
    public Name: string;
    public Property: string;
    public Unique: boolean;
  
    constructor(
      name: string,
      property: string = '',
      unique: boolean = true
    ) {
        this.Name = name;
        this.Property = property;
        this.Unique = unique;
    }
  }
  