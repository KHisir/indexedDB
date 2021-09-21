import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IndexedDBStore } from './cc-indexedDBStore';

@Injectable({
  providedIn: 'root'
})
export class CcIndexedDBService {
  private idb: any;
  private idbName: string;
  private idbVersion: number;

  constructor() {
    this.idb = indexedDB;
    this.idbName = "MyFirstIDB"; // by default
    this.idbVersion = 1; // by default
  }

  checkBrowserSupport() {
    if (window.indexedDB) {
      alert('This browser support IndexedDB');
    } else {
      alert('This browser doesn\'t support IndexedDB');
    }
  }

  setDB(dbName: string, dbVersion: number = 1): Promise<boolean> {
    const promise = new Promise<boolean>((resolve, reject) => {
      try {
        if (dbName.length > 0 && dbName !== undefined) {
          this.idbName = dbName;
          this.idbVersion = dbVersion;
          resolve(true); //successed!
        } else {
          console.error('Error: wrong dbName');
          reject('Error: wrong dbName');
        }
      } catch (error) {
        reject(error);
      }
    })
    return promise;
  }

  deleteDB(): Observable<any> {
    let self = this;

    return Observable.create((observer: any) => {
      let request = this.idb.deleteDatabase(this.idbName);

      request.onsuccess = () => {
        observer.next("done");
        observer.complete();
      };
      request.onerror = () => {
        self.handleError("Could not delete indexed db.");
      };
      request.onblocked = () => {
        self.handleError(
          "Couldn not delete database due to the operation being blocked."
        );
      };
    });
  }

  private openDB(dbName?: string, dbVersion?: number): Observable<any> {
    let self = this;

    if (dbName === undefined) {
      dbName = this.idbName;
    }

    if (dbVersion === undefined) {
      dbVersion = this.idbVersion;
    }

    return Observable.create((observer: any) => {
      let DBOpenRequest = this.idb.open(dbName, dbVersion);

      DBOpenRequest.onsuccess = () => {
        observer.next(DBOpenRequest.result);
        observer.complete();
      };
      DBOpenRequest.onerror = () => self.handleError(DBOpenRequest.error);
    });
  }

  createStore(stores: IndexedDBStore[]): Observable<any> {
    let self = this;

    return Observable.create((observer: any) => {
        let DBOpenRequest: any = this.idb.open(this.idbName, this.idbVersion);

        DBOpenRequest.onupgradeneeded = () => {  
          const db = DBOpenRequest.result;
          for (let i = 0; i < stores.length; i++) {
            if (!db.objectStoreNames.contains(stores[i].Name)) {
              let objStore: any;
              
              // Creating object store
              if (stores[i].PrimaryKey !== '' && stores[i].PrimaryKey !== undefined && stores[i].PrimaryKey !== null) {
                objStore = db.createObjectStore(stores[i].Name, { keyPath: stores[i].PrimaryKey, autoIncrement: stores[i].AutoIncrement });
              } else {
                objStore = db.createObjectStore(stores[i].Name, { autoIncrement: stores[i].AutoIncrement });
              }
  
              // Defining indexes
              for (let i = 0; i < stores[i].Indexes.length; i++) {
                if (stores[i].Indexes[i].Name !== '' && stores[i].Indexes[i].Name !== undefined && stores[i].Indexes[i].Name !== null && stores[i].Indexes[i].Property !== '' && stores[i].Indexes[i].Property !== undefined && stores[i].Indexes[i].Property !== null) {
                  objStore.createIndex(stores[i].Indexes[i].Name, stores[i].Indexes[i].Property, { unique: stores[i].Indexes[i].Unique });
                }
              }
            }
          }
  
          observer.next("done");
          observer.complete();
        };
  
        DBOpenRequest.onerror = () => {
          self.handleError(DBOpenRequest.error);
        };
  
        DBOpenRequest.onsuccess = () => {
          DBOpenRequest.result.close();
        };
    });
  }

  clearStore(storeName: string): Observable<any> {
    let self = this;

    return Observable.create((observer: any) => {
      this.openDB().subscribe((db: any) => {
        try {
          let tx = db.transaction(storeName, "readwrite");
          let store = tx.objectStore(storeName);

          store.clear();

          tx.oncomplete = () => {
            observer.next(storeName);
            db.close();
            observer.complete();
          };
          db.onerror = (e: any) => {
            db.close();
            self.handleError("IndexedDB error: " + e.target.errorCode);
          };
        } catch (error) {
          console.error("IndexedDB error: " + error);
          observer.error(error);
        }
      });
    });
  }

  put(source: string, object: any): Observable<any> {
    let self = this;

    return Observable.create((observer: any) => {
      this.openDB().subscribe((db: any) => {
        try {
          let tx = db.transaction(source, "readwrite");
          let store = tx.objectStore(source);
          store.put(object);

          tx.oncomplete = () => {
            observer.next(object);
            db.close();
            observer.complete();
          };
          db.onerror = (e: any) => {
            db.close();
            self.handleError("IndexedDB error: " + e.target.error.message);
          };
        } catch (error) {
          console.error("IndexedDB error: " + error);
          observer.error(error);
        }
      });
    });
  }

  post(source: string, object: any): Observable<any> {
    let self = this;

    return Observable.create((observer: any) => {
      this.openDB().subscribe((db: any) => {
        try {
          let tx = db.transaction(source, "readwrite");
          let store = tx.objectStore(source);
          let request = store.add(object);

          request.onsuccess = (e: any) => {
            observer.next(e.target.result);
            db.close();
            observer.complete();
          };
          db.onerror = (e: any) => {
            db.close();
            self.handleError("IndexedDB error: " + e.target.error.message);
          };
        } catch (error) {
          console.error("IndexedDB error: " + error);
          observer.error(error);
        }
      });
    });
  }

  get(source: string, id: string): Observable<any> {
    let self = this;

    return Observable.create((observer: any) => {
      this.openDB().subscribe((db: any) => {
        try {
          let tx = db.transaction(source, "readonly");
          let store = tx.objectStore(source);
          // let index = store.index("id_idx");
          // let request = index.get(id);
          let request = store.get(id);

          request.onsuccess = () => {
            observer.next(request.result);
            db.close();
            observer.complete();
          };
          db.onerror = (e: any) => {
            db.close();
            self.handleError("IndexedDB error: " + e.target.error.message);
          };
        } catch (error) {
          console.error("IndexedDB error: " + error);
          observer.error(error);
        }
      });
    });
  }

  all(source: string): Observable<any[]> {
    let self = this;

    return Observable.create((observer: any) => {
      let indexName = "id_idx";

      this.openDB().subscribe((db: any) => {
        try {
          let tx = db.transaction(source, "readonly");
          let store = tx.objectStore(source);
          let index = store.index(indexName);
          let request = index.openCursor(); //IDBKeyRange.only("Fred")
          let results: any[] = [];

          request.onsuccess = function() {
            let cursor = request.result;
            if (cursor) {
              results.push(cursor.value);
              cursor.continue();
            } else {
              observer.next(results);
              db.close();
              observer.complete();
            }
          };
          db.onerror = (e: any) => {
            db.close();
            self.handleError("IndexedDB error: " + e.target.error.message);
          };
        } catch (error) {
          console.error("IndexedDB error: " + error);
          observer.error(error);
        }
      });
    });
  }

  remove(source: string, id: string): Observable<any> {
    let self = this;

    return Observable.create((observer: any) => {
      this.openDB().subscribe((db: any) => {
        try {
          let tx = db.transaction(source, "readwrite");
          let store = tx.objectStore(source);

          store.delete(id);

          tx.oncomplete = (e: any) => {
            observer.next(id);
            db.close();
            observer.complete();
          };
          db.onerror = (e: any) => {
            db.close();
            self.handleError("IndexedDB error: " + e.target.error.message);
          };
        } catch (error) {
          console.error("IndexedDB error: " + error);
          observer.error(error);
        }
      });
    });
  }

  count(source: string): Observable<number> {
    let self = this;

    return Observable.create((observer: any) => {
      this.openDB().subscribe((db: any) => {
        try {
          let indexName = "id_idx";
          let tx = db.transaction(source, "readonly");
          let store = tx.objectStore(source);
          let index = store.index(indexName);
          let request = index.count();

          request.onsuccess = () => {
            observer.next(request.result);
            db.close();
            observer.complete();
          };
          db.onerror = (e: any) => {
            db.close();
            self.handleError("IndexedDB error: " + e.target.error.message);
          };
        } catch (error) {
          console.error("IndexedDB error: " + error);
          observer.error(error);
        }
      });
    });
  }

  private handleError(msg: string) {
    console.error(msg);
    return Observable.throw(msg);
  }
}
