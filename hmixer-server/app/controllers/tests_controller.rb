class TestsController < ApplicationController
  def metrics
    @submissions = Submission.all
    respond_to do |format|
      format.html
      format.json
    end

  end
end
