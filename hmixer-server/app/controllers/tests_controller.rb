class TestsController < ApplicationController
  def metrics
    #@submissions = Submission.includes(:user, :contributions).find(1) #Submission 1 is currently a default defined in seeds.rb
    @submissions = Submission.find(1, :include => [:user, :contributions => :metric])
    #@submissions = Submission.all(:include => [:user, :contributions])
    @submissions_json = @submissions.to_json(:include => [:user, :contributions => {:include => :metric}])
    respond_to do |format|
      format.html
      format.json
    end

  end

  def show
    @submission = Submission.find(params[:id], :include => [:user, :contributions])

    respond_to do |format|
      format.html
      format.json
    end
  end

  #primarily to handle created of nested Submission object
  #def new
  #  @submission = Submission.new
  #  @submission.user = User.find_or_create_by_email(:email => params['submitter']['email'], :full_name => params['submitter']['full_name'])
  #end

  def create

  end

end
