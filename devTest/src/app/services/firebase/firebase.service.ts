import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireList } from '@angular/fire/compat/database';
import { Record } from 'src/app/models/record';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private dbPath = '/records';
  modelRef: AngularFireList<Record>;

  constructor(private db: AngularFireDatabase) { 
    this.modelRef = db.list(this.dbPath);
  }

  getAll(): AngularFireList<Record> {
    return this.modelRef;
  }
  
  create(Record: Record){
    return this.modelRef.push(Record);
  }

}
