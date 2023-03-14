import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  socket = new WebSocketSubject('wss://ws.bitmex.com/realtime?subscribe=instrument,orderBookL2_25:XBTUSD');

  sellSide: any[] = [];
  buySide: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.initWorker();
    // setTimeout(() => {
    //   this.socket.unsubscribe();
    // }, 3000)
  }


  initWorker() {
    this.socket.subscribe((res) => {
      let obj: any = res;
      console.log(obj);
      if(obj?.action === 'partial' && obj?.table === 'orderBookL2_25'){
          console.log('full data', obj?.data)
          obj?.data.map((row:any) => {row.side == 'Sell' ? this.sellSide.push(row) : this.buySide.push(row)});
      } else if(obj?.action === 'update' && obj?.table === 'orderBookL2_25') {
        //find matching rows and update them
        let data = obj?.data;
        for(let i = 0; i < data.length ; i++) {
          if(data[i].side == 'Sell') {
            let refId = data[i].id;
            this.sellSide.map((row:any) => {
              if(row.id == refId) {
                console.log('from price ' + row.price);
                console.log('to ' + data[i].price);
                row.price = data[i].price != null && data[i].price != undefined ? data[i].price : row.price;
                row.size = data[i].size != null && data[i].size != undefined ? data[i].size : row.size;
                // this.sellSide.splice(this.sellSide.indexOf(row), 1, data[i])
              }
              // row.id == refId ? this.sellSide.splice(this.sellSide.indexOf(row), 1, data[i]) : ;
            })
          }
        } 
        console.log('update');
      }
        
      },
      (e) => {
        console.error('error:', e);
      },
      () => {
        console.log('Socket closed');
      }
    );
  }

  stopWorker() {
    this.socket.unsubscribe();
    console.log('Socket closed');
  }
}
