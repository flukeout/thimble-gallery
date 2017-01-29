// Thimble Gallery V1

$(document).ready(function(){
  gallery.init(activities); // activities is the JSON data for all activities
});


var gallery = {

  // Initialize the gallery and display activities
  init: function(activities) {
    var that = this;

    // Add all the click handlers.
    this.galleryEl = $(".gallery");

    this.galleryEl.on("click",".clear",function(){ that.clearSearch() });
    this.galleryEl.on("keydown",".search",function(e){ that.keyPressed(e) });
    this.galleryEl.on("focus",".search",function(e){ that.toggleClear() });
    this.galleryEl.on("blur",".search",function(e){ that.toggleClear() });
    this.galleryEl.on("click",".tag",function(){ that.tagClicked($(this).attr("tag")) });
    this.galleryEl.on("click",".search-tags .remove",function(){ that.removeTag($(this).parent()) });
    this.galleryEl.on("click",".start-over",function(){ that.startOver() });

    this.activities = activities;
    this.filterActivities();
  },

  removeTag : function(tag) {

    var tagName = tag.attr("tag");
    var index = this.searchTerms.indexOf(tagName);
    if(index > -1) {
      this.searchTerms.splice(index,1);
    }
    tag.remove();
    this.filterActivities();
    this.toggleClear();
  },

  typeInterval : false, // Keeps track of if a user is typing
  searchSpeed : 500,    // How long do we wait between keystrokes to search?
  mode : "featured",    // Featured vs Search, affects the layout
  searchTerms : [],

  // Fires whenever someone types into the search field
  keyPressed : function(e) {
    clearTimeout(this.typeInterval);
    var that = this;

    // Removes the last tag if there is no search term
    if($(".search").val().length == 0 && e.keyCode == 8) {
      var tagNum = $(".search-tags .search-tag").length;
      if(tagNum > 0) {
        this.removeTag($(".search-tag:last-child"));
        return;
      }
    }

    // if($(".search").val().length > 0) {
      this.typeInterval = setTimeout(function(){
        that.toggleClear();
        that.filterActivities();
      }, that.searchSpeed);
    // }
  },


  // Determines which activities should have a display: true
  filterActivities : function(){

    if($('.search').val().length > 0 || this.searchTerms.length > 0) {
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

        activity.display = true;

        // Check all the search terms...

        for(var j = 0; j < this.searchTerms.length; j++) {
          var thisTerm = this.searchTerms[j];
          searchString.indexOf(thisTerm) < 0 ? activity.display = false : null;
        }

        searchString.indexOf(this.term) < 0 ? activity.display = false : null;
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


    var resultCount = 0

    for(var i = 0; i < activities.length; i++) {
      var activity = activities[i];

      if(activity.display) {
        resultCount++;
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

    if(resultCount > 0) {
      $(".no-results").hide();
    } else {
      $(".no-results").show();
    }

    if(resultCount > 1) {
      $(".popular-tags").show();
    } else {
      $(".popular-tags").hide();
    }

    if(this.mode == "featured" || resultCount == 0) {
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
      var push = false;

      for(var i = this.searchTerms.length; i >= 0; i--) {
        var searchTerm = this.searchTerms[i];
        if(this.searchTerms.indexOf(k) < 0) {
          push = true;
        }
      }

      if(push) {
        tagsArray.push([k, tags[k]]);
      }
    }

    tagsArray.sort(function(x,y){
      return y[1] - x[1];
    });

    var tagNumber = 5;

    tagNumber > tagsArray.length ? tagNumber = tagsArray.length : null;

    for(var i = 0; i < tagNumber; i++) {
      var tag = tagsArray[i];
      $(".tag-list").append("<a class='tag' tag='"+tag[0]+"' title='Search for projects tagged " + tag[0] + "'>" + tag[0] + " <span class='count'>" + tag[1] + "<span></a>");
    }

    if(type == "featured") {
      $(".popular-tags .tags-title").text("Popular tags");
    } else {
      $(".popular-tags .tags-title").text("Add filter");
    }

    if(tagNumber > 0) {
      $(".popular-tags .tags-title").show();
    } else {
      $(".popular-tags .tags-title").hide();
    }
  },


  // Handles when any tag is clicked.
  tagClicked : function(term) {


    $(".search-tags").append("<span tag='"+term+"'class='search-tag'>" + term + "<a class='remove'></a></span>");

    $(".search-wrapper-outer").addClass("pop");
    setTimeout(function(){
      $(".search-wrapper-outer").removeClass("pop");
    },200)



    this.searchTerms.push(term);
    this.filterActivities();
    this.toggleClear();
  },


  // Shows and hides the clear button in the search field when appropriate
  toggleClear: function() {

    if($(".search").is(":focus")){
      this.galleryEl.addClass("has-focus");
    } else {
      this.galleryEl.removeClass("has-focus");
    }

    var termLength = $(".search").val().length;

    if(termLength > 0) {
      this.galleryEl.addClass("has-term");
    } else {
      this.galleryEl.removeClass("has-term");
    }

    if(this.searchTerms.length > 0) {
      this.galleryEl.addClass("has-tags");
    } else {
      this.galleryEl.removeClass("has-tags");
    }

  },


  startOver : function(){
    $(".search").val("");
    $("[active]").removeAttr("active");

    this.searchTerms = [];
    $(".search-tags *").remove();
    this.filterActivities();
  },


  // Clears the search field
  clearSearch : function() {

    // Shouldn't redo the search unless there is a change...

    $(".search").val("");

    this.filterActivities();
    this.toggleClear();
  },
}
