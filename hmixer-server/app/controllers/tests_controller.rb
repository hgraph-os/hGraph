class TestsController < ApplicationController
  def metrics
    #@submissions = Submission.includes(:user, :contributions).find(1) #Submission 1 is currently a default defined in seeds.rb
    @submissions = Submission.find(1, :include => [:user, :contributions => [:metric, :demographic]])
    @hmixer = submission_to_hmixer(@submissions)
    @hmixer_json = @hmixer.to_json() 
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
    @vari = JSON.parse(params[:mixer])
    @submissions = Submission.find(1, :include => [:user, :contributions => [:metric, :demographic]])
   # @contributions_male = @submissions.contributions.joins(:demographic).where(:demographics => {:gender => "male"})

    @metrics = @vari.map{|c| {:name => c['name'], :features => 
        {:healthyrange => [c['healthyrange'][0],c['healthyrange'][1]], :totalrange => [c['totalrange'][0],c['totalrange'][1]], 
        :boundayflags => [false,true], :weight => c['weight'], :unitlabel => c['unitlabel']} } }
    @demo = {:gender => params[:gender]}
    met = [:demographics => @demo, :metrics => @metrics]
    
    puts @submissions.contributions.inspect
    puts met
    @submissions.update_attributes(:contributions => met)
  end

  private
  def submission_to_hmixer(submission)
    @contributions_male = submission.contributions.joins(:demographic).where(:demographics => {:gender => "male"})
    @contributions_female = submission.contributions.joins(:demographic).where(:demographics => {:gender => "female"})
    
    @metrics_male = @contributions_male.map{|c| {:name => c.metric.name, :features => 
        {:healthyrange => [c.healthy_min,c.healthy_max], :totalrange => [c.total_min,c.total_max], 
        :boundayflags => [false,true], :weight => c.score_weight, :unitlabel => c.metric.unit} } }

    @metrics_female = @contributions_female.map{|c| {:name => c.metric.name, :features => 
        {:healthyrange => [c.healthy_min,c.healthy_max], :totalrange => [c.total_min,c.total_max], 
        :boundayflags => [false,true], :weight => c.score_weight, :unitlabel => c.metric.unit} } }
    
    male = { :gender => "male", :metrics => @metrics_male }
    female = { :gender => "female", :metrics => @metrics_female }

    hmixer = [male, female]

    return hmixer
  end

end
