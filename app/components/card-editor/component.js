/**
 * card-edit:component
 *
 * Responsible for wrapping a card component, and managing it's settings
 *
 */
import Ember from 'ember';

import layout from './template';
export default Ember.Component.extend({
  layout:layout,

  /**
   * Get the event bus
   */
  eventBus: Ember.inject.service('event-bus'),

  showEditor:false,
  showInlineEdit:false,
  model:null,
  canvasPosition: null,

  //where on the CARD
  editorAttachment:Ember.computed('showEditor', function(){
    let width = this.get('model.width');
    let x = this.get('model.x');
    let pos = 'top right';
    if(width >= 10){
      pos = 'top left';
    }else{
      if(x <= 3){
        pos = 'top left';
      }
    }

    Ember.debug('editorAttachment: x:' + x + ' w:' + width + ' : ' + pos);
    return pos;
  }),
  //where on the EDITOR
  editorTargetAttachment:Ember.computed('showEditor', function(){
    //get the width of the Component
    let width = this.get('model.width');
    let x = this.get('model.x');
    let pos = 'top left';
    if(width >= 10){
      pos = 'top left';
    }else{
      if(x <= 3){
        pos = 'top right';
      }
    }


    Ember.debug('editorTargetAttachment: x:' + x + ' w:' + width + ' : ' + pos);
    return pos;
  }),

  classNames:['card-editor'],
  classNameBindings: ['showEditor','dropTargetClass'],
  attributeBindings: ['draggable'],
  draggable:true,
  dropTargetClass:'',

  /**
   * Initialize the card-edit component
   */
  init: function(){
    this._super(...arguments);
    //standard settings shared w/ the card-canvas - move into a mixin
    //or some other clean means of sharing
    this.COLUMNS = 12;
    this.ROWS = 0;
    this.HEIGHT  = 0;
    this.HPADDING = 0;
    this.VPADDING = 20;
    this.VMARGIN = 20;
    this.CELLHEIGHT= 60;
  },

  // dragStart(event){
  //   let cp = this.$().position();
  //   Ember.debug('DD Card-Editor dragStart...');
  //   Ember.debug('DD dragStart this.$().position().top: ' + cp.top);
  //   Ember.debug('DD dragStart this.$().position().left: ' + cp.left);
  //   this.startPosition = this.$().position();
  //   this.set('eventBus.movingCard', this.get('model'));
  //   //Ember.debug('eventui.position.left: ' + ui.position.left)
  //   event.target.style.background = 'red';
  //
  // },
  //
  // dragEnd(event){
  //   Ember.debug('DD Card-Editor dragEnd...');
  //   event.target.style.background = '';
  //
  //   Ember.debug('DD this.$().offset().left: ' + this.$().offset().left);
  //   Ember.debug('DD this.$().offset().top: ' + this.$().offset().top);
  //   // Ember.debug('DD this.$().position().left: ' + this.$().position().left);
  //   // Ember.debug('DD this.$().position().top: ' + this.$().position().top);
  //   // Ember.debug('DD event.originalEvent.clientX: ' + event.originalEvent.clientX);
  //   // Ember.debug('DD event.originalEvent.clientY: ' + event.originalEvent.clientY);
  //   // Ember.debug('DD event.currentTarget.offsetLeft: ' + event.currentTarget.offsetLeft);
  //   // Ember.debug('DD event.currentTarget.offsetTop: ' + event.currentTarget.offsetTop);
  //
  //   //let droppedPosition = this.get('eventBus.drop');
  //
  //   // let newLeft = droppedPosition.left; //event.currentTarget.offsetLeft;
  //   // let newTop = droppedPosition.top; //event.currentTarget.offsetTop;
  //   // this.CELLWIDTH = this.$().parent().width() / this.COLUMNS;
  //   // var cellHeight = this.CELLHEIGHT + this.VMARGIN;
  //   // let new_x = Math.round(newLeft / this.CELLWIDTH);
  //   // let new_y =  Math.floor((newTop + cellHeight / 2) / cellHeight);
  //   // if(this.set('model.x') === new_x ){
  //   //   //revert x
  //   //   this.$().css('top', this.startPosition.top );
  //   // }else{
  //   //   this.set('model.x' , new_x );
  //   // }
  //   // if(this.set('model.y') === new_y ){
  //   //   //revert y
  //   //   this.$().css('left', this.startPosition.left );
  //   // }else{
  //   //   this.set('model.y' , new_y );
  //   // }
  //   //
  //   // this.sendAction('onLayoutChangeComplete', this.get('model'));
  //
  //   //return false;
  // },

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


  didInsertElement: function(){
    this.set('canvasPosition',this.$().parent().position() );
    var el = this.$();
    let card = this.get('model');
    this.set('cardEditorSelector', '#'+this.get('elementId'));
    //apply data elements which drive styles
    this.updateCardStyle(card);

    // if(this.get('model.isNew')){
    //   Ember.debug('Scrolling new card into view...');
    //   document.getElementById(this.get('elementId')).scrollIntoView();
    //   let m = this.get('model');
    //   delete m.isNew;
    // }

    el.resizable({
      autoHide:true,
      //containment:'parent',
      minHeight:120,
      minWidth:120,
      handles:'e, w, s, se, sw',
      resize: (/*event, ui*/) => {
        //Ember.debug('card-editor: Card Resizing...');
        //see if this is spilling over the sides



        this.sendAction('onLayoutChange', this.get('model'));
      },
      start: (/*event, ui*/)=>{
        this.CELLWIDTH = this.$().parent().width() / this.COLUMNS;
        this.startHeight = this.$().height();
        this.startWidth = this.$().width();

        this.minLeft = 0;
        this.maxRight = this.$().parent().width();

        //set the minWidth to 2/12th of the parent
        //let cellWidthPx = this.$().parent.outerWidth() / this.COLUMNS;
        let minWidthCols = this.get('model.component.minWidth') || 2;
        el.resizable('option', 'minWidth', this.CELLWIDTH  * minWidthCols );
        //Ember.debug('card-editor: Card Resize started');
      },
      stop: (event, ui)=>{
        Ember.debug('card-editor: Card Resize Stopped...');
        var cellHeight = this.CELLHEIGHT + this.VMARGIN;
        //Check that the card is inside the bounds of the canvas
        var elementRight = ui.position.left + ui.size.width;
        var elementLeft = ui.position.left;
        Ember.debug('minLeft: ' + this.minLeft + ' el.left: ' + elementLeft);
        Ember.debug('maxRight: ' + this.maxRight + ' el.right: ' + elementRight);
        if( elementRight >= this.maxRight){
          Ember.debug('Right Edge of Card is too far right. Snapping back to canvas edge.');
          let w = this.maxRight - ui.position.left;
          this.$().width(w);
          ui.size.width = w;
        }
        if( elementLeft < 0){
          Ember.debug('Left Edge of Card is too far left. Snapping back to canvas edge.');
          this.$().css('left', 0 );
          ui.position.left = 0;
          //also reset width
          this.$().width(this.startWidth);
          ui.size.width = this.startWidth;
        }

        this.set('model.x', Math.round(ui.position.left / this.CELLWIDTH));
        this.set('model.y', Math.floor((ui.position.top + cellHeight / 2) / cellHeight));
        let new_height =  Math.round(ui.size.height / cellHeight);
        let new_width = Math.round(ui.size.width / this.CELLWIDTH);
        if(this.get('model.height') === new_height){
          //revert it
          this.$().height(this.startHeight);
        }else{
          this.set('model.height',new_height);
        }
        if(this.get('model.width') === new_width){
          //revert
          this.$().width(this.startWidth);
        }else{
          this.set('model.width', new_width);
        }


        //this.updateCardStyle(this.get('model'));
        this.sendAction('onLayoutChangeComplete', this.get('model'));
      }
    })
    .draggable({
      scroll:false,
      containment:'parent',
      // drag:   (event, ui)=>{
      //   this.sendAction('onLayoutChange', this.get('model'));
      //   // var x = Math.round(ui.position.left / 60),
      //   //     y = Math.floor((ui.position.top + 60 / 2) / 60);
      //   //Ember.debug('card-editor: Card Dragging x:' + x + ' y:' + y);
      // },
      // start:  (event, ui)=>{
      //   this.startPosition = ui.position;
      //   Ember.debug('JQD: ui.position.left: ' + ui.position.left);
      //   Ember.debug('JQD: ui.position.top: ' + ui.position.top);
      //
      //   //Ember.debug('card-editor: Card Drag Started...');
      // },
      stop:   (event, ui)=>{
        //Ember.debug('JQDD: Card Drag Stopped...');
        this.CELLWIDTH = this.$().parent().width() / this.COLUMNS;
        var cellHeight = this.CELLHEIGHT + this.VMARGIN;
        // Ember.debug('JQDD newTop: ' + ui.position.top);
        // Ember.debug('JQDD newLeft: ' + ui.position.left);
        let new_x = Math.round(ui.position.left / this.CELLWIDTH);
        let new_y =  Math.floor((ui.position.top + cellHeight / 2) / cellHeight);
        if(this.set('model.x') === new_x ){
          //revert x
          this.$().css('top', this.startPosition.top );
        }else{
          this.set('model.x' , new_x );
        }
        if(this.set('model.y') === new_y ){
          //revert y
          this.$().css('left', this.startPosition.left );
        }else{
          this.set('model.y' , new_y );
        }

        this.sendAction('onLayoutChangeComplete', this.get('model'));
      }
    });

  },

  /**
   * When the layout properties change on the model, update the data attruibutes
   * which handle the positioning
   */
  layoutChanged:  Ember.observer('model.x', 'model.y','model.height', 'model.width', function() {
    Ember.run.once(this, 'updateCardStyle', this.get('model'));
  }),

  /**
   * Display the editor for this Card
   * @param  {Card} card The model passed to the editor
   */
  editCard: function(/*card*/){
    Ember.debug('setting showEditor:true');
    //if an editor component is defined, then we use it
    if(this.get('model').component.editor){
      this.set('showEditor', true);
    }else{
      //otherwise we will pass inlineEdit=showInlineEdit to the component
      this.set('showInlineEdit', !this.get('showInlineEdit') );
    }

  },

  /**
   * Update the data attributes of the card, which is what
   * the css is keyed off of
   * @param  {Card} card Card object
   */
  updateCardStyle: function(card){

    let el = this.$();
    //apply data elements which drive styles
    el.attr('data-gs-x', card.x)
      .attr('data-gs-y', card.y)
      .attr('data-gs-width', card.width)
      .attr('data-gs-height', card.height)
      .removeAttr('style');

  },

  actions: {
    deleteCard: function(){
      Ember.debug('card-editor:deleteCard caught...');
      this.sendAction('onCardDelete', this.get('model'));
      this.destroy();
    },
    /**
     * Show the editor for the card
     */
    editCard: function(){
        Ember.debug('card-editor:editCard ');
        let card = this.get('model');
        this.editCard(card);
    },
    onModelChanged: function(){
      Ember.debug('card-editor:onModelChanged ');
      this.get('eventBus').trigger('modelChanged');
    },
    closeEditor: function(){
      this.set('showEditor', false);
    }

  }


});
