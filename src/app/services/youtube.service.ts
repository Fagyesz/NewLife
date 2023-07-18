import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
declare var gapi: any;

@Injectable({
  providedIn: 'root',
})
export class YoutubeService {
  private apiKey: string = 'AIzaSyARX5uDclRE65EMGtH1LUmfQ11V_wYQj1k';
  private url: string = '';
  private urlSearch: string = 'https://www.googleapis.com/youtube/v3/search';
  private urlChannel: string = 'https://www.googleapis.com/youtube/v3/channels';
  private urlVideos: string = 'https://www.googleapis.com/youtube/v3/videos';
  
  constructor(private http: HttpClient) {}

  getVideoDetails(videoId: string): Observable<any> {
   
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('part', 'snippet')
      .set('id', videoId);

    return this.http.get<any>(this.urlVideos, { params });
  }
  getVideoTitle(videoId: string): Observable<string> {
    const url = 'https://www.googleapis.com/youtube/v3/videos';
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('part', 'snippet')
      .set('id', videoId);

    return this.http.get<any>(url, { params }).pipe(
      map((response) => {
        // Extract the title from the API response
        const title = response?.items?.[0]?.snippet?.title;
        return title || '';
      })
    );
  }

  hasOngoingLiveVideos(channelId: string): Observable<boolean> {
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('part', 'snippet')
      .set('channelId', channelId)
      .set('eventType', 'live')
      .set('type', 'video')
      .set('maxResults', '1');

    return this.http.get<any>(url, { params }).pipe(
      map((response) => {
        return response?.items?.length > 0;
      })
    );
  }
  
  getOngoingLiveVideoId(channelId: string): Observable<string | null> {
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('part', 'snippet')
      .set('channelId', channelId)
      .set('eventType', 'live')
      .set('type', 'video')
      .set('maxResults', '1');

    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        if (response?.items?.length > 0) {
          return response.items[0].id.videoId;
        } else {
          return null;
        }
      })
    );
  }
  getOngoingLiveVideoTitle(channelId: string): Observable<string | null> {
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const params = new HttpParams()
      .set('key', this.apiKey)
      .set('part', 'snippet')
      .set('channelId', channelId)
      .set('eventType', 'live')
      .set('type', 'video')
      .set('maxResults', '1');

    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        if (response?.items?.length > 0) {
          return response.items[0].id.title;
        } else {
          return null;
        }
      })
    );
  }
}
