import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {
  isDragging:false,
  components:[],
  rows:[],
  sections:[],
  // Used when a dragging UX is in progress. It serves as a communication hub.
  draggingProperties: null,
  draggingInProgress: Ember.computed.notEmpty('draggingProperties'),
  // Used by dock components to indicate which one is active. Others should disable mouse activities
  // until this property is null again.
  activeEventsHandler: null,
  actionInProgress: Ember.computed.notEmpty('activeEventsHandler'),
  /**
   * Delegated mouse event handlers
   */
  setMouseHandlers(moveHandler, upHandler){
    console.log('layoutCoordinator setting mousehandlers...');
    // this.set('moveHandler', moveHandler);
    // this.set('upHandler', upHandler);
    Ember.$('body').on('mousemove', moveHandler);
    Ember.$('body').on('mouseup', upHandler);
  },
  clearMouseHandlers(moveHandler, upHandler){
    console.log('layoutCoordinator clearning mousehandlers...');
    // Ember.$('body').off('mousemove', this.get('moveHandler'));
    // Ember.$('body').off('mouseup', this.get('upHandler'));
    Ember.$('body').off('mousemove', moveHandler);
    Ember.$('body').off('mouseup', upHandler);
  },

  mouseMove(event){

    if(this.get('draggingProperties')){
      console.log('layoutCoordinator internal mousemove');
      let position = {
        left: event.originalEvent.clientX + window.pageXOffset,
        top: event.originalEvent.clientY + window.pageYOffset
      };
      //tried to throttle this, but ends up being janky
      //Ember.run.throttle(this, this.updateDragging, position, 30, true);
      this.updateDragging(position);
    }
  },

  mouseUp(event){
    if(this.get('draggingProperties')){
      console.log('layoutCoordinator internal mouseup');
      this.set('draggingProperties', null);
    }
  },

  startDragging(draggingProperties){
    console.log('layoutCoordinator got startDragging at ', draggingProperties);
    //set the drag properties
    this.setProperties({
      draggingProperties: Ember.Object.create(draggingProperties)
    });
    //clear any current mouseHandlers
    this.clearMouseHandlers();
    //setup our own mouse handlers
    console.log('startDragging setting internal mousehandlers');
    this.setMouseHandlers( Ember.run.bind(this, this.mouseMove), Ember.run.bind(this, this.mouseUp) );
    //update our dragging
    this.updateDragging();
  },
  updateDragging: function (position) {
    console.log('layoutCoordinator updateDragging ');

    let draggingProperties = this.get('draggingProperties');
    if (!draggingProperties && !position) {
      return;
    }

    if (!position) {
      position = draggingProperties.get('mousePosition');
    } else {
      draggingProperties.set('mousePosition', position);
    }
    //opsdash solves the issue of showing the drop-targets by
    //doing a hit-test against the absolutely positioned elements here
    //that solves the problem of mouseenter / leave events not firing
    //on the cards.
    //see if we intersect any cards...
    let cards = this.get('components');
    let cardFound = cards.find(function(card){
      let cp = card.get('componentPosition');
      //console.log('CP for ' + card.get('elementId') + ': ', cp);
      return position.left >= cp.left && position.left <= (cp.left + cp.width) && position.top >= cp.top && position.top <= (cp.top + cp.height);
    });
    if(cardFound){
      console.log('Got hit for card : ' + cardFound.get('elementId'));
      this.trigger( 'showCardDropTargets' , cardFound );
    }else{
      this.trigger( 'showCardDropTargets',null  );
    }

    //ok - handle rows...
    //this is fine because there should always be row drop-targets
    let rows = this.get('rows');
    let rowFound = rows.find(function(row){
      let cp = row.get('componentPosition');
      //console.log('CP for ' + card.get('elementId') + ': ', cp);
      return position.left >= cp.left && position.left <= (cp.left + cp.width) && position.top >= cp.top && position.top <= (cp.top + cp.height);
    });

    if(rowFound){
      console.log('Got hit for row : ' + rowFound.get('elementId'));
      this.trigger( 'showRowDropTargets' , rowFound );
    }else{
      this.trigger( 'showRowDropTargets',  null  );
    }

    //sections


    //console.log('Will position element at ' + position.top + ' ' + position.left);
    // var layoutElement = this.getLayoutElementFromPoint(position); //hit test
    // if (!layoutElement) {
    //   draggingProperties.set('dockWheelLayoutElement', null);
    //   return;
    // }
    //
    // let targetLayoutElement = this.getDockableLayoutElement(layoutElement);
    // if (targetLayoutElement === draggingProperties.get('sourceLayoutElement')) {
    //   draggingProperties.set('dockWheelLayoutElement', null);
    //   return;
    // }
    //
    // draggingProperties.set('dockWheelLayoutElement', targetLayoutElement);
  },

});
