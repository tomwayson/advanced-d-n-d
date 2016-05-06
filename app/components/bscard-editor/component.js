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
    console.log("Drag Enter: ID: " + this.get('elementId'));

    let $el = Ember.$(event.target);

    //We are entering something that's a child of our element
    if($el.parents('#'+this.get('elementId')).length){
      //this.set('cardHover', true);
      if($el.attr('id')!== this.get('elementId')){
        this.set('ignoreNextLeave', true);
      }
    }

    this.set('cardPosition',this.$().position());
    this.set('cardSize', {
      height: this.$().height(),
      width : this.$().width()
    });

  },

  drop(event){
    this.set('dropTargetClass', '');
  },

  dragOver(event){
    //get the x,y from the event

    //console.log('clientX: ' + event.originalEvent.clientX + ' clientY: ' + event.originalEvent.clientY);
    //console.log('offsetX: ' + event.originalEvent.offsetX + ' Y: ' + event.originalEvent.offsetY);
    let mousePos = {
      x: event.originalEvent.offsetX,
      y: event.originalEvent.offsetY
    };

    console.log('X: ' + mousePos.x + ' Y: ' + mousePos.y);
    //get the size of this element
    let card = this.get('cardPosition');
    card.ht = this.get('cardSize.height');
    card.wd = this.get('cardSize.width');
    card.bottom = card.top + card.ht;
    card.right = card.left + card.wd;

    console.info('Card: top: ' + card.top + ' bottom: ' + card.bottom + ' left: ' + card.left + ' Right: ' + card.right);

    let proximity = card.wd / 2;
    let targetClass = '';
    let currentInsertionPoint = {};
    //Close to the left
    if(mousePos.x < proximity){
      //targetClass='drop-left';
      Ember.$('.crack').css({
        "display":"block",
        "top":card.top,
        "left":card.left,
        "height":card.ht,
        "width":"4px"
      });
      currentInsertionPoint.x = this.get('model.x');
      currentInsertionPoint.y = this.get('model.y');
    }

    //Close to the right
    if(mousePos.x > ( card.wd - proximity ) ) {
      //targetClass= 'drop-right';
      currentInsertionPoint.x = this.get('model.x') + this.get('model.width');
      currentInsertionPoint.y = this.get('model.y');
    }

    //Close to the top
    //console.log( 'card.top:' + card.top + ' y: ' + mousePos.y +' prx: ' + (card.top + proximity));
    if(mousePos.y > card.top && mousePos.y < (card.top + proximity) ){
      //targetClass= 'drop-top';
      currentInsertionPoint.x = this.get('model.x');
      currentInsertionPoint.y = this.get('model.y');
    }

    //Close to the bottom
    if(mousePos.y > (card.top + card.ht - proximity) && mousePos.y < (card.top + card.ht) ){
      //targetClass= 'drop-bottom';
      currentInsertionPoint.x = this.get('model.x');
      currentInsertionPoint.y = this.get('model.y') + this.get('model.height');
    }
    //set the class once
    this.set('dropTargetClass', targetClass);
    //determine if close to an edge
    //assign a drop-style
    this.set('eventBus.dropPosition', currentInsertionPoint);
    //console.log('Drop will insert at: ' + currentInsertionPoint.x + ', ' + currentInsertionPoint.y);

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
