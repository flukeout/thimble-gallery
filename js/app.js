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

    this.galleryEl.on("click",".tag",function(){ that.tagClicked($(this).attr("tag")) });

    // Updates the focus styling on the text search field
    this.galleryEl.on("focus",".search",function(e){ that.updateFocus() });
    this.galleryEl.on("blur",".search",function(e){ that.updateFocus() });

    this.galleryEl.on("click",".search-tags .remove",function(){ that.removeTag($(this).parent()) });
    this.galleryEl.on("click",".start-over",function(){ that.startOver() });

    this.activities = activities;
    this.filterActivities();
  },


  // Removes one of the tags that is currently being used as a filter
  removeTag : function(tagEl) {
    var tagName = tagEl.attr("tag");
    var index = this.searchTags.indexOf(tagName);
    if(index > -1) {
      this.searchTags.splice(index,1);
    }
    tagEl.remove();
    this.filterActivities();
    this.updateUI();
  },

  typeInterval : false, // Keeps track of if a user is typing
  searchSpeed : 500,    // How long do we wait between keystrokes to search?
  mode : "featured",    // Featured vs Search, affects the layout
  searchTags : [],      // The selected tags that we're filtering with

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

    this.typeInterval = setTimeout(function(){
      that.updateUI();
      that.filterActivities();
    }, that.searchSpeed);
  },


  // Determines which activities should have a display: true
  filterActivities : function(){

    if($('.search').val().length > 0 || this.searchTags.length > 0) {
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

      var searchTerms = $(".search").val().toLowerCase().split(" ");

      for(var i = 0; i < this.activities.length; i++) {
        var activity = this.activities[i];
        var searchString = activity.title + activity.description + activity.tags + activity.author;
        searchString = searchString.toLowerCase();

        activity.display = true;

        // Check for each of the selected tags...
        for(var j = 0; j < this.searchTags.length; j++) {
          var thisTerm = this.searchTags[j];
          searchString.indexOf(thisTerm) < 0 ? activity.display = false : null;
        }

        // Check for each of the search terms...
        for(var j = 0; j < searchTerms.length; j++) {
          var thisTerm = searchTerms[j];
          searchString.indexOf(thisTerm) < 0 ? activity.display = false : null;
        }
      }
    }

    var that = this;
    $(".activities").addClass("fade");

    setTimeout(function(){
      that.displayActivities(that.activities);
      that.updateUI();
    },150);
    setTimeout(function(){
      $(".fade").removeClass("fade");
    },300);

  },

  // The template for each item we display for an activity
  itemTemplate : $(`
    <div class='activity'>
      <a class='thumbnail'></a>
      <div class='details'>
        <h1 class='title'></h1>
        <p class='author'>By <a href='#'>Mozilla</a></p>
        <p class='description'></p>
        <div class='tags'></div>
      </div>
      <div class='buttons'>
        <a class="remix">Remix</a>
        <a class="teaching-kit">Lesson Plan</a>
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
        newItem.find(".author a").text(activity.author);
        newItem.find(".author a").attr("href", activity.author_url);
        newItem.find(".description").text(activity.description);

        // Check if activity_url ends with a slash, if it doesn't - add one before adding "remix"
        var remix = "remix";
        var endsWithSlash = (activity.url.charAt(activity.url.length-1) == "/")
        if(!endsWithSlash) {
          remix = "/remix"
        }
        newItem.find(".remix").attr("href", activity.url + remix);
        newItem.find(".teaching-kit").attr("href", activity.teaching_kit_url);

        for(var j = 0; j < activity.tags.length; j++) {
          newItem.find(".tags").append("<a class='tag' tag='"+activity.tags[j]+"' title='See other projects tagged " + activity.tags[j] + "' >" + activity.tags[j] + "</a> ");
        }

        $(".activities").append(newItem);
      }
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

      for(var i = this.searchTags.length; i >= 0; i--) {
        var searchTerm = this.searchTags[i];
        if(this.searchTags.indexOf(k) < 0) {
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

    this.searchTags.push(term);
    this.filterActivities();
    this.updateUI();

    // TODO - add GA tracking event here
  },


  updateFocus: function() {

    if($(".search").is(":focus")){
      this.galleryEl.addClass("has-focus");
    } else {
      this.galleryEl.removeClass("has-focus");
    }

  },

  // Shows and hides the clear button in the search field when appropriate
  updateUI: function() {

    var displaycount = 0

    for(var i = 0; i < this.activities.length; i++) {
      var activity = this.activities[i];
      if(activity.display) {
        displaycount++;
      }
    }

    if(this.mode == "search") {
      var string = displaycount + " project" + ( displaycount > 1 ? "s" : "") + " found";
      this.galleryEl.find(".results-title").text(string);
    } else {
      this.galleryEl.find(".results-title").text("Featured projects");
    }

    var termLength = $(".search").val().length;

    if(termLength > 0) {
      this.galleryEl.addClass("has-term");
    } else {
      this.galleryEl.removeClass("has-term");
    }

    if(this.searchTags.length > 0) {
      this.galleryEl.addClass("has-tags");

    } else {
      this.galleryEl.removeClass("has-tags");
    }

    if(displaycount > 0) {
      $(".no-results").hide();
      this.galleryEl.find(".results-title").show();
    } else {
      $(".no-results").show();
      this.galleryEl.find(".results-title").hide();
    }

    if(displaycount > 1) {
      $(".popular-tags").css("opacity",1);
    } else {
      $(".popular-tags").css("opacity",0);
    }

    if(this.mode == "featured" || displaycount == 0) {
      this.displayTags("featured");
    } else {
      this.displayTags("search");
    }

  },

  startOver : function(){
    $(".search").val("");
    $("[active]").removeAttr("active");

    this.searchTags = [];
    $(".search-tags *").remove();
    this.filterActivities();
  },


  // Clears the search field
  clearSearch : function() {

    // Shouldn't redo the search unless there is a change...

    $(".search").val("");

    this.filterActivities();
    this.updateUI();
  },
}
