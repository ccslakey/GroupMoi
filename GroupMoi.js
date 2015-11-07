Groups = new Mongo.Collection("groups");


if (Meteor.isClient) {
  // do some clienty stuff
  Meteor.subscribe("groups");

  Template.body.helpers({
      groups: function () {
          // Find all groups and list the newest groups first
          return Groups.find({}, {sort: {createdAt: -1}});
      }
  });
  


  /* BODY EVENT LISTENERS
  new-group will grab the text from the group textbox and send it to the addGroup function
  new-number is the same as above but calls the addNumber function.
  new-text is also the same as above but calls the sendMessage function. 
  */
  Template.body.events({
      "submit .new-group": function (event) {
          // Grab group name from text field
          var newGroup = event.target.group.value;
          // Check that text field is not blank before adding group
          if (newGroup !== '') {
              Meteor.call("addGroup", newGroup);
          }
          // Clear the text field for next entry
          event.target.group.value = "";
          // Prevent default form submit
          return false;
      },
      "submit .new-number": function (event) {
          // Grab phone number from text field
          var newNumber = event.target.number.value;
          // Check that text field is not blank before adding number
          if (newNumber !== '') {
              Meteor.call("addNumber", this._id, newNumber);
          }
          // Clear the text field for next entry
          event.target.number.value = "";
          // Prevent default form submit
          return false;
      },
      "submit .new-text": function (event) {
          // Grab text message from text field
          var newMessage = event.target.message.value;
          // Check that message field is not blank before sending texts
          if (newMessage !== '') {
              Meteor.call("sendMessage", newMessage);
          }
          // Clear the text field
          event.target.message.value = "";
          alert('Your message is being sent!');
          // Prevent default form submit
          return false;
      }
  });
  


  /* GROUP EVENT LISTENERS
  These four methods make up the toggling functionality 
  that will allow a user to select/deselect 
  individual groups or numbers when blasting out a text
  */
  Template.group.events({
      "click .toggle-group": function () {
          // Set the checked property to the opposite of its current value
          Meteor.call("toggleGroup", this._id, !this.checked);
      },
      "click .toggle-number": function () {
          // Get the number's group data
          var data = Template.instance().data;
          // Set the checked property to the opposite of its current value
          Meteor.call("toggleNumber", data._id, this.number, !this.checked);
      },
      "click .delete-group": function () {
          // Remove a group from our collection
          Meteor.call("deleteGroup", this._id);
      },
      "click .delete-number": function () {
          // Get the number's group data
          var group = Template.instance().data;
          // Remove a number from a particular group
          Meteor.call("deleteNumber", group._id, this.number);
      }
  });




// end of client
}

if (Meteor.isServer) {
    // Specify which collections are sent to the client
    Meteor.publish("groups", function () {
        return Groups.find({
            owner: this.userId
        });
    });


    Meteor.methods({

      /*
      addGroup will insert a new group into our Groups
      collection. By default, new groups will 
      be empty and will not be selected.
      */
        addGroup: function (name) {
            Groups.insert({
                name: name,
                createdAt: new Date(),
                owner: Meteor.userId(),
                checked: false,
                numbers: []
            });
        },
        /*
        addNumber will insert a new number into a 
        group’s numbers array. By default, new numbers
        will be selected.
        */
        addNumber: function (groupId, number) {
            Groups.update(
                {_id: groupId},
                {$addToSet: {numbers: {"number": number, "checked": true }}}
            );
        },
        // remove a group by id
        deleteGroup: function (groupId) {
            Groups.remove(
                {_id: groupId}
            );
        },
        // remove number from a group by updating the numbers array and removing that #
        deleteNumber: function (groupId, number) {
            Groups.update(
                {_id: groupId}, 
                { $pull: { numbers: {"number": number}}}
            );
        },
        // select/deselect all numbers in a group
        toggleGroup: function (groupId, toggle) {
            Groups.update(
                {_id: groupId}, 
                { $set: { checked: toggle}}
            );
            // Find every number that differs from Group's "checked" boolean
            var numbers = 
                Groups.find(
                    {numbers: { $elemMatch: {"checked": !toggle}}}
                );
            // Set all numbers to match Group's "checked" boolean
            numbers.forEach(function (setter) {
                for (var index in setter.numbers) {
                    Groups.update(
                        { _id: groupId, "numbers.number": setter.numbers[index].number }, 
                        { $set: {"numbers.$.checked": toggle} }
                    );
                }
            });
        },
        // select and deselct individual number in a group
        toggleNumber: function (groupId, number, toggle) {
            Groups.update(
                { _id: groupId, "numbers.number": number }, 
                { $set: {"numbers.$.checked": toggle} }
            );
        },


    });




// end of server
}