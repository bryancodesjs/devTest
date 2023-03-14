import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BitmexService {
  
  constructor() { }
  
  // socket = new WebSocketSubject('wss://ws.bitmex.com/realtime?subscribe=instrument,orderBookL2_25:XBTUSD');
  // private socketData: any = new Subject<any>();
  // initWorker() {
  //   this.socket.subscribe((res) => {
  //       console.log(res);
  //     },
  //     (e) => {
  //       console.error('error:', e);
  //     },
  //     () => {
  //       console.log('Socket closed');
  //     }
  //   );
  // }

  // readData(): Observable<any> {
  //   return this.socketData.asObservable();
  // }

  // stopWorker() {
  //   this.socket.unsubscribe();
  //   console.log('Socket closed');
  // }
}
