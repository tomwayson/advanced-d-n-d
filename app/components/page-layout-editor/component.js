/**
 * page-layout-editor/component.js
 */
import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  layout,
  classNames: ['page-layout-editor'],
  classNameBindings: ['actionInProgress:disable-user-select'],
  hasSections: Ember.computed('model.sections.length', function() {
    return this.get('model.sections.length') > 0;
  }),

  dropTargetModel: null,


  // // Used when a dragging UX is in progress. It serves as a communication hub.
  // draggingProperties: null,
  // draggingInProgress: Ember.computed.notEmpty('draggingProperties'),
  // // Used by dock components to indicate which one is active. Others should disable mouse activities
  // // until this property is null again.
  // activeEventsHandler: null,
  // actionInProgress: Ember.computed.notEmpty('activeEventsHandler'),

  /**
   * Get the coordinator service
   */
  layoutCoordinator: Ember.inject.service('layout-coordinator'),

  init(){
    this._super(...arguments);
    //event handler to listen to layoutCoordinator
    //Ember.$('body').on('mousemove', Ember.run.bind(this, this.bodyMouseMove));
    this.get('layoutCoordinator').on('showDropTarget', this, 'onShowDropTarget');
    this.get('layoutCoordinator').on('hideDropTarget', this, 'onHideDropTarget');
  },

  willDestroyElement(){
    //Ember.$('body').off('mousemove', Ember.run.bind(this, this.bodyMouseMove));
    this.get('layoutCoordinator').off('showDropTarget', this, 'onShowDropTarget');
    this.get('layoutCoordinator').off('hideDropTarget', this, 'onHideDropTarget');
  },

  /**
   * Drop-Target is a shared control across the entire
   * page-layout. It's used to show the location of a
   * drop target. By using a shared element, we can
   * only have one active at a time.
   */
  onShowDropTarget(dropTargetModel){
    this.set('dropTargetModel', dropTargetModel);
    this.$('.drop-target').css({display:'block'});
  },

  /**
   * Simply hide the Drop-Target
   */
  onHideDropTarget(){
    this.$('.drop-target').css({display:'none'});
  },

  // dragEnter(event){
  //   let td = this.get('layoutCoordinator.transferData');
  //
  //   // only if dragged object is a section
  //   if(!td || td.objectType !=='section') {
  //     return;
  //   }
  //   console.info('PAGE-LAYOUT-EDITOR VALID DROP TARGET FOR ' + td.objectType);
  //   event.preventDefault();
  //
  //   // TODO: what to do w/ dragged section
  // },
  //
  // dragOver(event){
  //   //can accept a section
  //   let td = this.get('layoutCoordinator.transferData');
  //
  //   // only if dragged object is a section
  //   if(!td || td.objectType !=='section') {
  //     return;
  //   }
  //
  //   // user is draggini sections, we'll handle this
  //   event.preventDefault();
  // },
  //
  // dragLeave(){
  //   this.get('layoutCoordinator').trigger('hideDropTarget');
  // },
  //
  // drop(/*event*/){
  //   let td = this.get('layoutCoordinator.transferData');
  //   // only if dragged object is a section
  //   if(!td || td.objectType !=='section') {
  //     return;
  //   }
  //   console.info('DROP ON PAGE-LAYOUT-EDITOR ' + this.get('elementId') + ' for ' + td.objectType);
  //
  //   // we're droppin' sections
  //   // get the section from the event bus
  //   let newSection = td.model;
  //   // if we're moving a section, need to first
  //   // remove it from the page
  //   if (td.dragType === 'move') {
  //     this._removeSection(newSection);
  //   }
  //
  //   // insert the section
  //   this._insertSection(newSection, td.dropSectionInfo.section, td.dropSectionInfo.insertAfter);
  //
  //   // clear event bus drag/drop info
  //   // and hide drop target
  //   this.set('layoutCoordinator.transferData', null);
  //   this.get('layoutCoordinator').trigger('hideDropTarget');
  // },

  _insertSection(section, targetSection, insertAfter) {
    const sections = this.get('model.sections');
    // where to insert?
    // default to the begining (left)
    let pos = 0;
    if (targetSection) {
      // if inserting before, use target card's current index
      // otherwise (inserting after) use the next index
      pos = sections.indexOf(targetSection) + (insertAfter ? 1 : 0);
    }
    sections.insertAt(pos, section);
  },

  _removeSection(section){
    console.info('PAGE-LAYOUT-EDITOR _removeSection');
    this.set('model.sections', this.get('model.sections').without(section));
  },

  // startDragging(draggingProperties){
  //   //console.log('page-layout-editor got startDragging at ', draggingProperties);
  //   this.setProperties({
  //     draggingProperties: Ember.Object.create(draggingProperties)
  //   });
  //   this.updateDragging();
  // },

  // mouseMove(event){
  //   if(this.get('draggingProperties')){
  //     let position = {
  //       left: event.originalEvent.clientX + window.pageXOffset,
  //       top: event.originalEvent.clientY + window.pageYOffset
  //     };
  //     //tried to throttle this, but ends up being janky
  //     //Ember.run.throttle(this, this.updateDragging, position, 30, true);
  //     this.updateDragging(position);
  //   }
  // },
  //
  // mouseUp(event){
  //   if(this.get('draggingProperties')){
  //     this.set('draggingProperties', null);
  //   }
  // },

  // updateDragging: function (position) {
  //   let draggingProperties = this.get('draggingProperties');
  //   if (!draggingProperties && !position) {
  //     return;
  //   }
  //
  //   if (!position) {
  //     position = draggingProperties.get('mousePosition');
  //   } else {
  //     draggingProperties.set('mousePosition', position);
  //   }
  //   //opsdash solves the issue of showing the drop-targets by
  //   //doing a hit-test against the absolutely positioned elements here
  //   //that solves the problem of mouseenter / leave events not firing
  //   //on the cards.
  //   //see if we intersect any cards...
  //   let cards = this.get('layoutCoordinator').components;
  //   let cardFound = cards.find(function(card){
  //     let cp = card.get('componentPosition');
  //     //console.log('CP for ' + card.get('elementId') + ': ', cp);
  //     return position.left >= cp.left && position.left <= (cp.left + cp.width) && position.top >= cp.top && position.top <= (cp.top + cp.height);
  //   });
  //   if(cardFound){
  //     console.log('Got hit for card : ' + cardFound.get('elementId'));
  //     this.get('layoutCoordinator').trigger( 'showCardDropTargets' , cardFound );
  //   }else{
  //     this.get('layoutCoordinator').trigger( 'showCardDropTargets',null  );
  //   }
  //
  //   //ok - handle rows...
  //   //this is fine because there should always be row drop-targets
  //   let rows = this.get('layoutCoordinator').rows;
  //   let rowFound = rows.find(function(row){
  //     let cp = row.get('componentPosition');
  //     //console.log('CP for ' + card.get('elementId') + ': ', cp);
  //     return position.left >= cp.left && position.left <= (cp.left + cp.width) && position.top >= cp.top && position.top <= (cp.top + cp.height);
  //   });
  //
  //   if(rowFound){
  //     console.log('Got hit for row : ' + rowFound.get('elementId'));
  //     this.get('layoutCoordinator').trigger( 'showRowDropTargets' , rowFound );
  //   }else{
  //     this.get('layoutCoordinator').trigger( 'showRowDropTargets',  null  );
  //   }
  //
  //   //sections
  //
  //
  //   //console.log('Will position element at ' + position.top + ' ' + position.left);
  //   // var layoutElement = this.getLayoutElementFromPoint(position); //hit test
  //   // if (!layoutElement) {
  //   //   draggingProperties.set('dockWheelLayoutElement', null);
  //   //   return;
  //   // }
  //   //
  //   // let targetLayoutElement = this.getDockableLayoutElement(layoutElement);
  //   // if (targetLayoutElement === draggingProperties.get('sourceLayoutElement')) {
  //   //   draggingProperties.set('dockWheelLayoutElement', null);
  //   //   return;
  //   // }
  //   //
  //   // draggingProperties.set('dockWheelLayoutElement', targetLayoutElement);
  // },


  actions: {
    onRowDrop(e, row) {
      this.sendAction('onDrop', e, row, this.get('moveRow'));
      this.set('moveRow', null);
    },
    onStartMove(e, row) {
      this.set('moveRow', row);
    },
    onRemoveSection(section){
      console.info('PAGE-LAYOUT-EDITOR onRemoveSection');
      this._removeSection(section);
    }

    // onRowDragEnter(row) {
    //   this.set('dragOverRow', row);
    //   // console.log('entered row', row.message);
    // },
    // onRowDragLeave(row) {
    //   if (this.get('dragOverRow') === row) {
    //     this.set('dragOverRow', null);
    //   }
    //   // console.log('leaving row', row.message);
    // }
  }
});
