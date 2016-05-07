import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'section',
  classNames:['layout-section-editor'],

  /**
   * Choose the container class name basd on the
   * containment property of the section
   */
  containerClass: Ember.computed('model.containment', function(){
    let containment = this.get('model.containment');
    return ( containment === 'fixed') ? 'container' : 'container-fluid';
  }),

  /**
   * The Style will actually be computed from a hash
   * but this is a short-cut to focus on other things
   */
  attributeBindings: ['style'],
  style: Ember.computed('model.style', function(){
    return this.get('model.style');
  }),

  /**
   * Get the event bus
   */
  eventBus: Ember.inject.service('event-bus'),

  dragEnter(event){
    // let td = this.get('eventBus.transferData');
    // console.info('DRAGENTER ON SECTION ' + this.get('elementId') + ' for ' + td.type);
    // if(td.type === 'add-row'){
    //   event.preventDefault();
    // }
    event.preventDefault();
  },
  dragOver(event){
    event.preventDefault();
    // let td = this.get('eventBus.transferData');
    // if(td.type === 'add-row'){
    //   event.preventDefault();
    // }
  },
  drop(event){
    let td = this.get('eventBus.transferData');

    //can accept an add-row action
    if(td.action === 'add-row'){
      console.info('DROP ON SECTION for ' + td.objectType + ' and  Action: ' + td.action);
      //create the row object and stuff the card into it the rows
      let row = {
        cards:[
          {
            "width":12,"component": {"name": "placeholder-card"}
          }
        ]
      };
      //figure out the position to inject it...
      let pos = 0;
      if(td.dropRowInfo.row){
        pos = this.get('model.rows').indexOf(td.dropRowInfo.row) + (td.dropRowInfo.insertAfter ? 1:0);
      }
      this.get('model.rows').insertAt(pos, row);
      this.set('eventBus.transferData', null);
    }
  },

  actions: {
    onRowDelete( row ){
      let rows = this.get('model.rows');

      //Scenarios
      // Section has one row, and we are deleting it
      //   - delete the section
      if( rows.length === 1 ) {
        this.sendAction('onDeleteSection', this.get('model'));
      }else{

      //  Section has > 1 row
      //    - delete the passed in row
        this.set('model.rows', this.get('model.rows').without(row));
      }
    }
  }

});
