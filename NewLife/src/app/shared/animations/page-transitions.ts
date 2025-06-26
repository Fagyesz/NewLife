import { trigger, transition, style, query, group, animate } from '@angular/animations';

export const pageTransition = trigger('pageTransition', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      })
    ], { optional: true }),
    
    query(':enter', [
      style({ 
        opacity: 0,
        transform: 'translateY(20px)'
      })
    ], { optional: true }),
    
    group([
      query(':leave', [
        animate('300ms ease-out', 
          style({ 
            opacity: 0,
            transform: 'translateY(-10px)'
          })
        )
      ], { optional: true }),
      
      query(':enter', [
        animate('400ms 150ms ease-out', 
          style({ 
            opacity: 1,
            transform: 'translateY(0)'
          })
        )
      ], { optional: true })
    ])
  ])
]);

export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
  ])
]);

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('400ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-out', style({ opacity: 0 }))
  ])
]);

export const scaleInOut = trigger('scaleInOut', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
      style({ transform: 'scale(1)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('200ms ease-out', 
      style({ transform: 'scale(0.9)', opacity: 0 })
    )
  ])
]);

export const bounceIn = trigger('bounceIn', [
  transition(':enter', [
    style({ transform: 'scale(0.3)', opacity: 0 }),
    animate('600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
      style({ transform: 'scale(1)', opacity: 1 })
    )
  ])
]);

export const staggeredList = trigger('staggeredList', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('300ms ease-out', 
        style({ opacity: 1, transform: 'translateY(0)' })
      )
    ], { optional: true })
  ])
]);

export const cardFlip = trigger('cardFlip', [
  transition(':enter', [
    style({ transform: 'rotateY(-90deg)', opacity: 0 }),
    animate('400ms ease-out', 
      style({ transform: 'rotateY(0deg)', opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate('300ms ease-in', 
      style({ transform: 'rotateY(90deg)', opacity: 0 })
    )
  ])
]); 