module.exports = function(grunt) {

  grunt.registerMultiTask('writeFiles', 'Writes out files', function() {
    // this.target, we don't care
    // this.data, we get the object that's the value

    var files = grunt.file.expand('tasks/write-files/*.html'),
        dstDir = this.data.dstDir;
    files.forEach(function(srcFile) {
      var dstFile = srcFile.replace('tasks/write-files', dstDir);
      grunt.log.write('Copying ' + srcFile + ' to ' + dstFile);
      grunt.file.copy(srcFile, dstFile);
    });

  });

};
