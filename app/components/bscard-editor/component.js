import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-editor'],
  classNameBindings:['bootstrapGridClass', 'dropTargetClass'],
  bootstrapGridClass:Ember.computed('model.width', function(){
    return 'col-md-' + this.get('model.width');
  }),
  dropTargetClass:'',

  /**
   * Get the event bus
   */
  eventBus: Ember.inject.service('event-bus'),

  ignoreNextLeave:false,

  dragEnter(event){

    console.log("Drag Enter: ID: " + this.get('elementId') + ' ClassNames: ' +event.currentTarget.className );

    let $el = Ember.$(event.target);
    let cardEl = $el[0];
    //We are entering something that's a child of our element
    if($el.parents('#'+this.get('elementId')).length){
      //if this element is not the root of the component...
      if($el.attr('id')!== this.get('elementId')){
        //skip the next leave event b/c it's NOT actually exiting the component...
        this.set('ignoreNextLeave', true);
        //get the root component div so we can get card sizes...
        cardEl = $el.parents('#'+this.get('elementId'))[0];
      }
    }
    //low-level DOM api for-the-win
    let card = cardEl.getBoundingClientRect();
    this.set('cardPosition', card);
  },

  drop(event){
    this.set('dropTargetClass', '');
    Ember.$('.crack').css({display:"none"});
  },

  dragOver(event){
    //get the x,y from the event
    let mousePos = {
      x: event.originalEvent.clientX,
      y: event.originalEvent.clientY
    };

    //get the card rectangle
    let card = this.get('cardPosition');

    console.info('Card: top: ' + card.top + ' Y: ' + mousePos.y + ' bottom: ' + card.bottom + ' left: ' + card.left + ' X: ' + mousePos.x +' Right: ' + card.right);

    //when you are within 1/4 of the dimension
    let xProximity = card.width / 4;
    let yProximity = card.height / 4;
    //default crack css
    let crackcss = {
      display:"none"
    };
    //default insertionPoint
    let currentInsertionPoint = {};

    /**
     * Determine if we are close to an edge...
     */

    //Close to the left
    if(mousePos.x > card.left && mousePos.x < (card.left + xProximity) ){

      crackcss = {
        "display":"block",
        "background-color":"green",
        "top":card.top,
        "left":card.left,
        "height":card.height,
        "width":"4px"
      };
      currentInsertionPoint.x = this.get('model.x');
      currentInsertionPoint.y = this.get('model.y');
    }

    //Close to the right
    if(mousePos.x > ( card.right - xProximity)  && mousePos.x < card.right )  {

      crackcss = {
        "display":"block",
        "background-color":"cyan",
        "top":card.top,
        "left":card.right,
        "height":card.height,
        "width":"4px"
      };
      currentInsertionPoint.x = this.get('model.x') + this.get('model.width');
      currentInsertionPoint.y = this.get('model.y');
    }

    //Close to the top
    //console.log( 'card.top:' + card.top + ' y: ' + mousePos.y +' prx: ' + (card.top + proximity));
    if(mousePos.y > card.top && mousePos.y < (card.top + yProximity) ){

      currentInsertionPoint.x = this.get('model.x');
      currentInsertionPoint.y = this.get('model.y');
      crackcss = {
        "display":"block",
        "background-color":"purple",
        "top":card.top,
        "left":card.left,
        "height":"4px",
        "width":card.width
      };
    }

    //Close to the bottom
    if(mousePos.y > (card.bottom - yProximity) && mousePos.y < (card.bottom) ){

      currentInsertionPoint.x = this.get('model.x');
      currentInsertionPoint.y = this.get('model.y') + this.get('model.height');
      crackcss = {
        "display":"block",
        "background-color":"navy",
        "top":card.bottom,
        "left":card.left,
        "height":"4px",
        "width":card.width
      };
    }
    //set the crack css
    Ember.$('.crack').css(crackcss);
    //set the drop position
    this.set('eventBus.dropPosition', currentInsertionPoint);

  },

  dragLeave(event){

    console.log('Drag Leave: event.target.className: ' + event.target.className);
    if(!this.get('ignoreNextLeave')) {
      this.set('dropTargetClass', '');

    }else{
      this.set('ignoreNextLeave', false);
    }
  },

  actions: {
    onModelChanged() {

    }
  }
});
