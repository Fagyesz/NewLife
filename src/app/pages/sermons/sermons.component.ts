import { Component, OnInit } from '@angular/core';
import { YoutubeService } from 'src/app/services/youtube.service';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { environment } from '../../../environment/environment';
import { iif } from 'rxjs';

@Component({
  selector: 'app-sermons',
  templateUrl: './sermons.component.html',
  styleUrls: ['./sermons.component.scss'],
})
export class SermonsComponent {
  public hasOngoingLive: boolean = false;
  public VideoId: string | null|undefined = null;
  public safeUrl: SafeResourceUrl = '';
  public notSafeUrl: SafeResourceUrl = '';
  public Title: string | null = null;
  public channelId: string = environment.channelId;
  public day = new Date().getDay();
  public hour = new Date().getHours();
  public minutes = new Date().getMinutes();
  public streamState: number | null = 0;
  public SafeUrl: SafeResourceUrl|null=null;

  constructor(
    private Youtube: YoutubeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    /* const channelId = 'UCSJ4gkVC6NrvII8umztf0Ow'; */ // Replace with the desired YouTube channel ID
    
    this.notSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/gh0TkRJanQ8'
    );
    this.SafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/live_stream?channel=' + this.channelId
    );
    console.log('notsafeurl:', this.channelId);
    console.log('notsafeurl:', this.notSafeUrl);
    if (startingSoon()) {
      this.streamState = 1;
      console.log(this.streamState);
    } else {
      console.log(this.streamState);
    }
    if (onLive()) {
      this.streamState = 2;
    }
    this.VideoId=getVideoId();

    function getVideoId() {
      const url = 'https://www.youtube.com/embed/live_stream?channel=UCMvAap1Jacyg-4bqYKDlmtw';
    

      // Extract the video ID using regular expressions
      const videoIdMatches = url.match(
        /(?:\/|v=|v%3D|embed\/|youtu.be\/|\/embed\/|\/v\/|youtube.com\/user\/[^#]*#([^\/]*?\/)*)?([^#\&\?]*).*/
      );
      if (videoIdMatches && videoIdMatches.length >= 2) {
        
        return /* VideoId = */ videoIdMatches[2];
        
      }
      console.error(Error);
      return null;
    }

    function startingSoon() {
      const day = new Date().getDay();
      const hour = new Date().getHours();
      if (day === 0 && hour < 10 && hour > 9) {
        return true;
      } else {
        return false;
      }
    }
    function onLive() {
      const day = new Date().getDay();
      const hour = new Date().getHours();
      if (day === 0 && hour <= 13 && hour >= 10) {
        return true;
      } else {
        return false;
      }
    }

    /*     this.Youtube.hasOngoingLiveVideos(channelId).subscribe(
      (result) => {
        this.hasOngoingLive = result;
        console.log('Has ongoing live videos:', this.hasOngoingLive);
      },
      (error) => {
        console.error(error);
      }
    );
    this.Youtube.getOngoingLiveVideoId(channelId).subscribe(
      (result) => {
        this.VideoId = result;
        
        this.safeUrl=this.sanitizer.bypassSecurityTrustResourceUrl("https://www.youtube.com/embed/"+result);  
        console.log('Has ongoing live videos id:', this.VideoId);
        console.log('safeurl', this.safeUrl);
      },
      (error) => {
        console.error(error);
      }
    )
    this.Youtube.getOngoingLiveVideoTitle(channelId).subscribe(
      (result) => {
        this.Title = result;
      
      },
      (error) => {
        console.error(error);
      }
    ) */
  }
}
