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
    Ember.$('body').on('mousemove', moveHandler);
    Ember.$('body').on('mouseup', upHandler);
  },
  clearMouseHandlers(moveHandler, upHandler){
    console.log('layoutCoordinator clearning mousehandlers...');
    Ember.$('body').off('mousemove', moveHandler);
    Ember.$('body').off('mouseup', upHandler);
  },

  /**
   * Centralized means to watch mouse movement and ensure
   * the intent is to DRAG vs just a sloppy click
   */
  checkDrag(event, component){

    if (this.get('disableEvents')){
      return;
    }

    let startPosition = {
      left: event.originalEvent.clientX + window.pageXOffset,
      top: event.originalEvent.clientY + window.pageYOffset
    };

    //set a local var so it's accessible inside the closures below
    let lc = this;

    // Check if the user is actually dragging the element
    function mousemove(evt) {

      let newPosition = {
        left: evt.originalEvent.clientX + window.pageXOffset,
        top: evt.originalEvent.clientY + window.pageYOffset
      };

      if (Math.abs(startPosition.left - newPosition.left) < 2 && Math.abs(startPosition.top - newPosition.top) < 2) {
        startPosition = newPosition;
      }else{
        lc.startDragging({
          component: component,
          mousePosition: newPosition
        });
        off();
      }
      return;
    }
    function off() {
      lc.clearMouseHandlers(mousemove,mouseup);
    }

    function mouseup() {
      lc.set('activeEventsHandler',null);
      off();
    }
    //kick it off
    lc.setMouseHandlers(mousemove, mouseup);
    return true;
  },

  mouseMove(event){

    if(this.get('draggingProperties')){
      //console.log('layoutCoordinator internal mousemove');
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
    //if we have draggingProperties... we may need to take some action
    if(this.get('draggingProperties')){
      let dp  = this.get('draggingProperties');
      this.handleDrop(dp);
      Ember.$('body').toggleClass('disable-user-select');
    }
  },

  startDragging(draggingProperties){
    //disable-user-select on body
    Ember.$('body').toggleClass('disable-user-select');
    //set the drag properties
    this.setProperties({
      draggingProperties: Ember.Object.create(draggingProperties)
    });
    //TODO: refactor so we don't need to do this arbitrary copying of properties
    this.set('draggingProperties.dragType', this.get('draggingProperties.component.dragType'));
    this.set('draggingProperties.dragAction', this.get('draggingProperties.component.dragAction'));
    //clear any current mouseHandlers
    this.clearMouseHandlers();
    //setup our own mouse handlers
    this.setMouseHandlers( Ember.run.bind(this, this.mouseMove), Ember.run.bind(this, this.mouseUp) );
    //update our dragging
    this.updateDragging();
  },

  updateDragging: function (position) {
    let draggingProperties = this.get('draggingProperties');
    if (!draggingProperties && !position) {
      return;
    }

    if (!position) {
      position = draggingProperties.get('mousePosition');
    } else {
      draggingProperties.set('mousePosition', position);
    }

    //---------------------
    // HIT TESTS
    //---------------------
    // We intersect the mouse position against all the cards, rows and sections
    // CARDS
    let cards = this.get('components');
    let cardFound = cards.find(function(card){
      let cp = card.get('componentPosition');
      //console.log('CP for ' + card.get('elementId') + ': ', cp);
      return position.left >= cp.left && position.left <= (cp.left + cp.width) && position.top >= cp.top && position.top <= (cp.top + cp.height);
    });
    if(cardFound){
      //console.log('Got hit for card : ' + cardFound.get('elementId'));
      if(this.get('draggingProperties.dragType') === 'card'){
        this.trigger( 'showCardDropTargets' , cardFound );
      }
      this.set('draggingProperties.targetCard', cardFound);
    }else{
      this.trigger( 'showCardDropTargets',null  );
    }

    //ROWS
    //this is fine because there should always be row drop-targets
    let rows = this.get('rows');
    let rowFound = rows.find(function(row){
      let cp = row.get('componentPosition');
      //console.log('CP for ' + row.get('elementId') + ': ', cp);
      return position.left >= cp.left && position.left <= (cp.left + cp.width) && position.top >= cp.top && position.top <= (cp.top + cp.height);
    });

    if(rowFound){
      //console.log('Got hit for row : ' + rowFound.get('elementId'));
      if(this.get('draggingProperties.dragType') === 'card'){
        this.trigger( 'showRowDropTargets' , rowFound );
      }
      this.set('draggingProperties.targetRow', rowFound);
    }else{
      this.trigger( 'showRowDropTargets',  null  );
    }

    //SECTIONS
    let sections = this.get('sections');
    let sectionFound = sections.find(function(section){
      let cp = section.get('componentPosition');
      return position.left >= cp.left && position.left <= (cp.left + cp.width) && position.top >= cp.top && position.top <= (cp.top + cp.height);
    });

    if(sectionFound){
      //only show the section targets if we are dragging a section
      if(this.get('draggingProperties.dragType') === 'section'){
        this.trigger( 'showRowDropTargets' , sectionFound );
      }
      this.set('draggingProperties.targetSection', sectionFound);
    }else{
      this.trigger( 'showSectionDropTargets',  null  );
    }
    //---------------------

  },

  handleDrop(draggingProperties){
    console.log('----------------------------');
    console.log(' DROP EVENT:');
    console.log('   TARGET CARD:' + draggingProperties.targetCard.get('elementId'));
    console.log('   TARGET ROW :' + draggingProperties.targetRow.get('elementId'));
    console.log('   TARGET SECTION :' + draggingProperties.targetSection.get('elementId'));
    console.log('   ----------------------------');
    console.log('   DOCK POSITION:' + draggingProperties.dockingTarget);
    console.log('   DRAGGED TYPE:' + draggingProperties.component.get('dragType'));
    console.log('   DRAGGED ACTION:' + draggingProperties.component.get('dragAction'));
    console.log('----------------------------');
    //hide the drop targets
    this.trigger('showCardDropTargets',null);
    this.trigger('showRowDropTargets',null);

    //expand out of the properties into vars we can reason about
    let dragType = draggingProperties.component.get('dragType');
    let dragAction = draggingProperties.component.get('dragAction');
    let dropTargetType = draggingProperties.dropTargetType;
    let targetCard = draggingProperties.targetCard;
    let targetRow = draggingProperties.targetRow;
    let targetSection = draggingProperties.targetSection;
    let dockingTarget = draggingProperties.dockingTarget;

    //if we have a card...
    if(dragType === 'card'){
      //if ACTION is ADD
      if(dragAction === 'add'){
        //and we are DROPPING on a CARD-TARGET...
        if(dropTargetType === 'card'){
          //call targetRow.insertCard(card, targetCard, dockingTarget)
          targetRow.insertCard(draggingProperties.component.get('model.defaults'), targetCard.get('model'), dockingTarget);
        }
        //and we are DROPPING on a ROW-TARGET
        if(dropTargetType === 'row'){
          //call targetSection.insertCard(card)
          targetSection.insertCard(draggingProperties.component, targetCard, dockingTarget);
        }
      }
      if(dragAction === 'move'){
        //and we are DROPPING on a CARD-TARGET...
        if(dropTargetType === 'card'){
          //let originalWidth = targetCard.get('model.width');
          let clone = Ember.copy(draggingProperties.component.get('model'), true);

          //remove it from it's old row, and resize the remaining cards...
          //brute-force it because this will not be a large collection
          let sections = this.get('sections');
          sections.forEach(function(sectionComponent){
            let sectionModel = sectionComponent.get('model');
            sectionModel.rows.forEach(function(rowModel){
              //find the row that contained the card...
              if(rowModel.cards.indexOf(draggingProperties.component.get('model')) > -1){
                targetSection.removeCard(draggingProperties.component.get('model'), rowModel);
              }
            });
          });

          targetRow.insertCard(clone, targetCard.get('model'), dockingTarget);
        }
        //and we are DROPPING on a ROW-TARGET
        if(dropTargetType === 'row'){
          //call targetSection.insertCard(card)
          targetSection.insertCard(draggingProperties.component, targetCard, dockingTarget);
        }
      }
    }//dragType===card

    // Sections are managed at the PAGE-LAYOUT-EDITOR level
    //if we have a section...
    if(dragType === 'section'){
      //we need to get the section that is the target
      let sections = this.get('sections');
      sections.forEach(function(sectionComponent){
        let sectionModel = sectionComponent.get('model');
        sectionModel.rows.forEach(function(rowModel){
          //find the row that contained the card...
          if(rowModel.cards.indexOf(draggingProperties.component.get('model')) > -1){
            targetSection.removeCard(draggingProperties.component.get('model'), rowModel);
          }
        });
      });

      if(dragAction === 'add'){
        this.get('layoutEditor').insertSection(draggingProperties.component.get('model.defaults'), targetSection.get('model'), dockingTarget);
      }
      if(dragAction ==='move'){
        //make a clone
        let clone = Ember.copy(draggingProperties.component.get('model'), true);
        this.set('layoutEditor.model.sections',this.get('layoutEditor.model.sections').without(draggingProperties.component.get('model')));
        //now inject the clone at the correct location
        this.get('layoutEditor').insertSection(clone, targetSection.get('model'), dockingTarget);
      }
    }

    //nuke the draggingProperties
    this.set('draggingProperties', null);
  }

});
