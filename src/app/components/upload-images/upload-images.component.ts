import { HttpEventType, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, ElementRef, ViewChild, Inject } from '@angular/core';
import { LyDialog } from '@alyle/ui/dialog';
import { ImgCropperEvent } from '@alyle/ui/image-cropper';
import { CropperDialog } from './cropper-dialog';
import { createLasso } from 'src/app/lassocreate';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UploadImagesComponent implements OnInit {
  @ViewChild("source") source: ElementRef | undefined;
  imageUrl?: any = "";
  myImageUrl?: string = "";
  myPolygon: string = "";
  selectedFiles?: FileList;
  message: string[] = [];
  cropped?: string;
  lasso: any;
  previews: any = [];
  imageInfos?: Observable<any>;
  lassoPreviews: any = [];
  //@ViewChild("source1") source1: ElementRef | undefined;

  constructor(
    private fileUploadService: FileUploadService, 
    private _dialog: LyDialog,
    private _cd: ChangeDetectorRef) {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  openCropperDialog(event: Event) {
    this.cropped = null!;
    this._dialog.open<CropperDialog, Event>(CropperDialog, {
      data: event,
      width: 320,
      disableClose: true
    }).afterClosed.subscribe((result?: ImgCropperEvent) => {
      if (result) {
        this.cropped = result.dataURL;
        this.previews.push(this.cropped)
        this._cd.markForCheck();
      }
    });
  }
  
  myUpdateImage (polygon){
    let img = new Image()
    img.src = this.imageUrl
    const div = document.getElementById("div")
    let rect = div.getBoundingClientRect()

    // create a new canvas with img derived sizes
    const canvas = document.createElement("canvas");

    const  ctx = canvas.getContext("2d");
    //document.body.appendChild(canvas);
    canvas.width = img.naturalWidth ;
    canvas.height = img.naturalHeight;

    img.onload = () => {
      //document.body.appendChild(img);
      const scalex = img.naturalWidth / rect.width;
      const scaley = img.naturalHeight / rect.height;

      // save the unclipped context
      ctx.save();

      // define the path that will be clipped to
      ctx.beginPath();
      const points = polygon.split(" ");
      //points.map(parseInt(i))
      let first = true;
      for (const point of points){
        const [x, y] = point.split(",");
        let _x:number = parseFloat(x) * scalex;
        let _y:number = parseFloat(y) * scaley;
        if (first) {
          ctx.moveTo(_x,_y);
          first = false;
        } else {
          ctx.lineTo(_x,_y);
        }
      }
      ctx.closePath();    
      // stroke the path
      // half of the stroke is outside the path
      // the outside part of the stroke will survive the clipping that follows
      ctx.lineWidth=2;
      ctx.stroke();

      // make the current path a clipping path
      ctx.clip();

      // Will draw the image as 300x227, ignoring the custom size of 60x45
      // given in the constructor
      ctx.drawImage(img, 0, 0);
      // restore the unclipped context (==undo the clipping path)
      ctx.restore();

      let imgUrl = ctx.canvas.toDataURL('image/jpeg', 1.0)
      this.myImageUrl = imgUrl
    }
  }

  initLasso(){
    let myupdate = (p: string) => {
      this.myUpdateImage(p);
      this._cd.markForCheck();
    };
    this.lasso = createLasso({
      element: this.source!.nativeElement,
      radius: 5,
      onChange: (polygon) =>{
        this.myPolygon = polygon
        myupdate(this.myPolygon)
      },
      onUpdate: (polygon) => {
        this.myPolygon = polygon
        myupdate(this.myPolygon)
      }
    })
  }

  uploadImage (){
    let myImageUrl = this.myImageUrl
    this.lassoPreviews.push(myImageUrl)
    this.lasso.reset()
  }

  selectFiles(event: any): void {
    //this.imageUrl
    this.selectedFiles = event.target.files;
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageUrl = e.target.result;
          this._cd.detectChanges()
        };
        reader.readAsDataURL(this.selectedFiles[i]);
      }
    }
  }

  /*upload(idx: number, file: File): void {
    if (file) {
      this.fileUploadService.upload(file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
          } 
          else if (event instanceof HttpResponse) {
            const msg = 'Uploaded the file successfully: ' + file.name;
            this.message.push(msg);
            this.imageInfos = this.fileUploadService.getFiles();
          }
        },
        (err: any) => {
          const msg = 'Could not upload the file: ' + file.name;
          this.message.push(msg);
        });
    }
  }

  uploadFiles(): void {
    this.message = [];
  
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    }
  }*/
}



