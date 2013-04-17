class TestsController < ApplicationController
  def metrics
    #@submissions = Submission.includes(:user, :contributions).find(1) #Submission 1 is currently a default defined in seeds.rb
    if params.has_key?(:email)
      @user = User.where(:email => params[:email])
      @submissions = Submission.find(Submission.where(:user_id => @user[0].id)[0].id, :include => [:user, :contributions => [:metric, :demographic]])
    else  
      @submissions = Submission.find(1, :include => [:user, :contributions => [:metric, :demographic]])
    end
    @hmixer = submission_to_hmixer(@submissions)
    @hmixer_json = @hmixer.to_json() 
    #@submissions = Submission.all(:include => [:user, :contributions])
    @submissions_json = @submissions.to_json(:include => [:user, :contributions => {:include => :metric}])
    respond_to do |format|
      format.html
      format.json
    end

  end
  
  def getuser
    begin
      @users = User.where(:email => params[:email])
      @submissions = Submission.find(Submission.where(:user_id => @users[0].id)[0].id, :include => [:user, :contributions => [:metric, :demographic]])
      @userdata = submission_to_userdata(@submissions, @users)
      @userdata_json = @userdata.to_json()
    rescue RuntimeError    
    end
  end

  def getsubmissions
    begin
      # @users = User.where(:email => params[:email])
      @submissions = Submission.all(:include => [:user, :contributions => [:metric, :demographic]])
      @submissions_json = @submissions.to_json()
      average_default()
    rescue RuntimeError
    end
  end

  def getuserparams
    begin
      @user = User.where(:id => params[:user_id])
      @user_json = @user.to_json()
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
    begin
      @user = User.where(:email => params[:email])
      @user[0].update_attribute('full_name', params[:name])
      @submissions = Submission.find(Submission.where(:user_id => @user[0].id)[0].id, :include => [:user, :contributions => [:metric, :demographic]])
      @submissions.update_attribute('message', params[:message])
      puts 'test' + @submission.inspect
      # @contributions_male = @submissions.contributions.joins(:demographic).where(:demographics => {:gender => "male"})
      hmixer_to_submission(@submissions, params);
    rescue RuntimeError
      @user = User.where(:email => params[:email])
      @user[0].update_attribute(:full_name => params[:name])
      puts 'test' + @user.inspect
      puts 'params length' + JSON.parse(params[:mixer]).length
      @contr = Array.new
      j = 1
      k = 1
      for i in 1..JSON.parse(params[:mixer]).length
        @contr << Contribution.new(:metric_id => j, :demographic_id => k)
        if i == JSON.parse(params[:mixer]).length/2
          j = 1
          k = 2
        else
          j = j + 1
        end
      end 
      @submissions = Submission.create(:user_id => @user[0].id, :contributions => @contr, :message => params[:message])
	@submissions.update_attribute('message', params[:message])
      hmixer_to_submission(@submissions, params)
    rescue NoMethodError
      @user = User.new(:email => params[:email], :full_name => params[:name])
            puts 'test' + @user.inspect
      @user.save()
      @contr = Array.new
      j = 1
      k = 1
      for i in 1..JSON.parse(params[:mixer]).length
        @contr << Contribution.new(:metric_id => j, :demographic_id => k)
        if i == JSON.parse(params[:mixer]).length/2
          j = 1
          k = 2
        else
          j = j + 1
        end
      end 
      @submissions = Submission.create(:user_id => @user.id, :message => params[:message], :contributions => @contr)
	@submissions.update_attribute('message', params[:message])
      hmixer_to_submission(@submissions, params)
    end  
    average_default()
    render :status => 200
  end

  def hmixer_to_submission(submission, params)
    
    @vari = JSON.parse(params[:mixer])
    
    @mets = @vari.map{|c| {:name => c['name'], :unit => c['unitlabel']}}
    
    @contr = @vari.map{|c| {:healthy_min => c['healthyrange'][0], :healthy_max => c['healthyrange'][1], 
                                      :total_min => c['totalrange'][0], :total_max => c['totalrange'][1],
                                      :score_weight => c['weight']} }
   
    puts 'Gender ' + params[:gender] + '\n'
    demo = {:gender => params[:gender]}
    #submission.contributions.demographic << (:demographic => @demo)
    @contributions = submission.contributions.readonly(false)
    @metrics = submission.contributions.joins(:metrics).where(:metric => @mets[0])
    
    puts 'Contributions Before: ' + @contributions.inspect 
  # puts 'Metrics: ' + @metrics.inspect + '\n'
    
    @contributions.zip(@contr).each do |c, co|
      
      puts 'co ' + co.inspect
      puts 'c before ' + c.inspect 
      c.update_attributes(co)
      puts 'c after ' + c.inspect
      
    end  
    
    puts 'Contributions After: ' + @contributions.inspect
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
    puts "Male: " + male.inspect
    puts "Female: " + female.inspect
    
    hmixer = [male, female]

    return hmixer
  end
  
  def submission_to_userdata(submission, user)
    @usr = User.find(user)
    puts @usr.inspect
    @data = {:name => @usr.full_name, :email => @usr.email, :message => submission.message} 
  end
  
  def average_default()
    @contributions = Contribution.all()
    arr = Array.new
    arr[1] = Array.new
    arr[2] = Array.new
    count = Array.new
    count[1] = Array.new
    count[2] = Array.new
    for met in Metric.all()
      arr[1][met.id] = Array.new
      arr[1][met.id][0] = 0
      arr[1][met.id][1] = 0
      arr[1][met.id][2] = 0
      count[1][met.id] = 0
      arr[2][met.id] = Array.new
      arr[2][met.id][0] = 0
      arr[2][met.id][1] = 0
      arr[2][met.id][2] = 0
      count[2][met.id] = 0
    end
    for cont in @contributions
      if cont.submission_id != 1
           puts cont.inspect
           arr[cont.demographic_id][cont.metric_id][0] += cont.healthy_min**2
           arr[cont.demographic_id][cont.metric_id][1] += cont.healthy_max**2
           arr[cont.demographic_id][cont.metric_id][2] += cont.score_weight**2
           count[cont.demographic_id][cont.metric_id] += 1
       end
    end
    puts "Average"
    puts arr.inspect
    for cont in @contributions
      if cont.submission_id == 1
        cont.update_attributes({:healthy_min => Math.sqrt(arr[cont.demographic_id][cont.metric_id][0]/count[cont.demographic_id][cont.metric_id]), :healthy_max => Math.sqrt(arr[cont.demographic_id][cont.metric_id][1]/count[cont.demographic_id][cont.metric_id]), :score_weight => Math.sqrt(arr[cont.demographic_id][cont.metric_id][2]/count[cont.demographic_id][cont.metric_id])})
      else
        break
      end
    end
  end
end
