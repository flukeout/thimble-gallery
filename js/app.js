// Thimble Gallery V1

$(document).ready(function(){
  gallery.init(activities); // activities is the JSON data for all activities
});


var gallery = {

  // Initialize the gallery and display activities
  init: function(activities) {
    var that = this;

    // Add all the click handlers.
    $(".gallery").on("click",".clear",function(){ that.clearSearch() });
    $(".gallery").on("keydown",".search",function(){ that.keyPressed() });
    $(".gallery").on("click",".tag",function(){ that.tagClicked($(this).attr("tag")) });

    this.activities = activities;
    this.filterActivities();
  },


  typeInterval : false, // Keeps track of if a user is typing
  searchSpeed : 300,    // How long do we wait between keystrokes to search?
  mode : "featured",    // Featured vs Search, affects the layout

  // Fires whenever someone types into the search field
  keyPressed : function() {
    clearTimeout(this.typeInterval);
    var that = this;
    this.typeInterval = setTimeout(function(){
      that.toggleClear();
      that.filterActivities();
    }, that.searchSpeed);
  },


  // Determines which activities should have a display: true
  filterActivities : function(){

    if($('.search').val().length > 0) {
      this.mode = "search";
    } else {
      this.mode = "featured"
    }

    // If there is no search term, shows the featured activities only
    if(this.mode == "featured") {
      for(var i = 0; i < this.activities.length; i++) {
        var activity = this.activities[i];
        activity.featured ? activity.display = true : activity.display = false;
      }
    }

    // Checks for the search term in the title, description  and tags
    if(this.mode == "search") {
      this.term = $(".search").val().toLowerCase();
      for(var i = 0; i < this.activities.length; i++) {
        var activity = this.activities[i];
        var searchString = activity.title + activity.description + activity.tags;
        searchString = searchString.toLowerCase();
        searchString.indexOf(this.term) > -1 ? activity.display = true : activity.display = false;
      }
    }


    var that = this;
    $(".activities, .popular-tags").addClass("fade");
    setTimeout(function(){
      that.displayActivities(that.activities);
    },150)
    setTimeout(function(){
      $(".fade").removeClass("fade");
    },300)

  },

  // The template for each item we display for an activity
  itemTemplate : $(`
    <div class='activity'>
      <a class='thumbnail'></a>
      <div class='details'>
        <h1 class='title'></h1>
        <p class='description'></p>
        <div class='tags'></div>
      </div>
      <div class='buttons'>
        <a class="remix">Remix</a>
        <a class="teaching-kit">Teaching Kit</a>
      </div>
    </div>
  `),


  // Adds all of the items in the activities array
  displayActivities: function(activities){

    $(".activities *").remove();

    var results = false;

    for(var i = 0; i < activities.length; i++) {
      var activity = activities[i];

      if(activity.display) {
        results = true;
        var newItem = this.itemTemplate.clone();
        newItem.find(".thumbnail").css("background-image","url("+activity.thumbnail_url+")" );
        newItem.find(".thumbnail").attr("href", activity.url);
        newItem.find(".title").text(activity.title);
        newItem.find(".description").text(activity.description);
        newItem.find(".remix").attr("href", activity.url + "/remix");
        newItem.find(".teaching-kit").attr("href", activity.teaching_kit_url);

        for(var j = 0; j < activity.tags.length; j++) {
          newItem.find(".tags").append("<a class='tag' tag='"+activity.tags[j]+"' title='See other projects tagged " + activity.tags[j] + "' >" + activity.tags[j] + "</a> ");
        }

        $(".activities").append(newItem);
      }
    }

    if(results) {
      $(".no-results").hide();
    } else {
      $(".no-results").show();
    }

    if(this.mode == "featured" || !results) {
      this.displayTags("featured");
    } else {
      this.displayTags("search");
    }
  },


  // Displays the list of tags under the search bar.
  displayTags: function(type){

    $(".tag-list .tag").remove();

    var tags = {};

    for(var i = 0; i < activities.length; i++) {
      var activity = activities[i];
      if(type == "featured" || activity.display) {
        for(var j = 0; j < activity.tags.length; j++) {
          var tag = activity.tags[j];
          if(!tags[tag]) {
            tags[tag] = 1;
          } else {
            tags[tag]++;
          }
        }
      }
    }

    var tagsArray = [];

    for(var k in tags) {
      tagsArray.push([k, tags[k]]);
    }

    tagsArray.sort(function(x,y){
      return y[1] - x[1];
    });

    var tagNumber = 5;

    tagNumber > tagsArray.length ? tagNumber = tagsArray.length : null;

    for(var i = 0; i < tagNumber; i++) {
      var tag = tagsArray[i];
      if(tag[0] != $(".search").val().toLowerCase()) {
        $(".tag-list").append("<a class='tag' tag='"+tag[0]+"' title='Search for projects tagged " + tag[0] + "'>" + tag[0] + " <span class='count'>" + tag[1] + "<span></a>");
      }
    }

    if(type == "featured") {
      $(".popular-tags .tags-title").text("Popular tags");
    } else {
      $(".popular-tags .tags-title").text("Related tags");
    }

    if(tagNumber > 0) {
      $(".popular-tags .tags-title").show();
    } else {
      $(".popular-tags .tags-title").hide();
    }
  },


  // Handles when any tag is clicked.
  tagClicked : function(term) {
    $(".search").val(term);
    $(".search").removeClass("pop").width($(".search").width());
    $(".search").addClass("pop");
    this.toggleClear();
    this.filterActivities();
  },


  // Shows and hides the clear button in the search field when appropriate
  toggleClear: function() {
    var termLength = $(".search").val().length;
    if(termLength > 0) {
      $(".gallery .search-wrapper").attr("active","");
    } else {
      $(".gallery .search-wrapper").removeAttr("active");
    }
  },


  // Clears the search field
  clearSearch : function() {
    $(".search").val("");
    this.filterActivities();
    this.toggleClear();
  },
}
