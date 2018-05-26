---
layout: post
current: post
cover:  assets/images/getting-to-know.jpg
navigation: True
title: Getting to know SDLC | Waterfall vs Agile Development
date: 2017-12-12 17:49:00
tags: [sdlc,agile development,waterfall]
class: post-template
subclass: 'post tag-getting-started'
author: ajatprabha
---

I was always curious to know, how a professional business software is developed from start to finish. Unlike what we do during our study of software designing or developing a hobby project, we don’t take the steps involved in making a professional software that seriously! But when you’re out there in the real world you can’t afford to mess things up due to the lack of a streamlined workflow. So while searching for a tested methodology for software development, I came across something called SDLC aka ‘Software Development Life Cycle’. It essentially used to describe the various processes involved in the development of a software viz.

1.  Requirement Analysis
2.  Design
3.  Development
4.  Testing
5.  Deployment
6.  Maintainance

<img src="http://ajatprabha.in/assets/images/SDLC-932x1024.png" alt="SDLC flow model" style="max-width: 400px;" />  
Source: Self-created

#### Requirement Analysis

This is the first step of SDLC in which the Product/Software owner analyses the problem at hand and the requirements needed to solve it, the features needed to be fulfilled by the end product. The analyst shall also look at the feasibility of the features in terms of Operational, Economical, Technical and Legal situations. The problem is then broken down into smaller requirements to simplify the goals that need to be achieved. Once this is done, the process moves to the next step.

#### Design

When all the features requirements and goals are documented, then a team of developers decides and describes various aspects of the software design viz.

1.  Business requirements and rules
2.  Functional and operational requirements
3.  Various diagrams such as process diagrams, activity diagrams, class diagrams, use-case diagrams, etc. [See [UML](https://en.wikipedia.org/wiki/Unified_Modeling_Language)]
4.  Choosing the languages/tools on which the system should be built
5.  UI/UX designing, etc

The end result of this stage will result in a well-documented requirement of modules and/or subsystems upon which the next step will continue.

#### Development

This is the step where all the documented requirements are converted into actual code. Several developers work on their assigned features on their own development environments. Once they complete their work, it is merged using [VCS](https://en.wikipedia.org/wiki/Version_control) and then it moves to the next step.

#### Testing

This is one of the most important steps of SDLC. During the past 2-3 decades, testing has become very important in SDLC. To simply put it:

> No Tests, No Deployment

Once the code is developed, then various types of tests are written and run on the code to find bugs and reassure the functioning of the software. It also helps in future quality assurance when refactoring is done, or a new feature is added, or an old one is removed. Tests will make sure that you don’t violate the contract that a function is bound to fulfil. There are [unit tests](http://ajatprabha.in/2017/12/20/tdd-why-bother), integration tests, automation tests, and performance tests, to name a few.

#### Deployment

Once testing is done and the quality is assured, then the software/product is deployed on a physical machine. This machine can be either a dedicated enterprise machine, say a data-centre or a client’s own machine.

#### Maintenance

Finally, the last step kicks in. In this, once deployed, the product is constantly reviewed for any bugs and other issues, if it can troubleshoot easily, then it’s okay otherwise it moves back again to Design step and the cycle is repeated. Now that we know what an SDLC is, let us discuss the SDLC models!

## SDLC Models

An SDLC model is used to describe the various steps involved based on the requirements of software, deadlines, quality, the speed of development, etc. While there are several models in SDLC viz. Waterfall, Spiral, Rapid-prototyping, etc. We’ll be looking only for Waterfall and Agile Development today.

## 1\. Waterfall

This model is basically a linear sequential approach to all the steps involved in SDLC. It’s very easy to understand and implement. It’s done in ‘stages’ from start to finish before a next stage can be started. It is preferred when all the requirements are already known and quality of the end product is required. There’s no short-term time frame to complete the task at hand, the software is usually created in one single go.  
<img src="http://ajatprabha.in/assets/images/waterfall-768x820.png" alt="Waterfall model" style="max-width: 512px;" />  
Source: Self-created

## 2\. Agile methodology

This model is an iterative approach to all the steps involved in SDLC. One of the most common types of agile craftsmanship is ‘SCRUM’. It’s done in ‘Sprints’. It is preferred when speed is required in developing the software/product. First, a story(one planned sprint) is pulled from the Product Backlog. A sprint usually lasts up to 2, 3 or 4 weeks. It first moves to Sprint Backlog where meetups are held, the sprint is here planned with the team and the scrum master. Also if there is any previous retrospection needed to be done then it also discussed beforehand. In the meetup, demos/reviews are done for each of the individual developers, they’ve to tell the team what they’ve done till now, what are the future plans and what hindrances they might be facing. During this whole sprint, the scrum master checks the flow in three phases viz. InDev, Ready for QA (Quality Assurance) and InQA, and if it passes all the phases then the scrum master marks the sprint as done or DOD (definition of done). During QA check, the steps involved in SDLC are verified, tests are run and should pass. There can also be certain specifications like a minimum percentage of tests, automation requirements, etc that might need to fulfil for getting DOD.

### Comparison:

1.  **Flow:** The waterfall is a linear sequential flow of steps in SDLC, whereas agile development goes through the steps iteratively in short cycles.
2.  **Interaction:** The waterfall has varied interaction with the client, i.e. High during requirement analysis and user acceptance, whereas agile development has constant Business interaction with clients as the cycles(sprints) are short.
3.  **Head of operations:** In waterfall, there is an overall Product Manager, whereas, in agile development (SCRUM), there is a scrum master.
4.  **Falling back:** In the waterfall model, one cannot fall back until a stage completed, whereas, in agile development, one can fall back at any instant of time because time span is usually short.
5.  **Requirement changes:** In waterfall, requirement changes are not possible without raising a change request which will re-initiate the whole process, whereas, in agile development, the new feature request can be shifted to next sprint, if it is not feasible in the current sprint.
6.  **Speed:** The pace of development is comparatively faster in agile development than to waterfall. Also due to lack of speed in the waterfall model, the technologies may go obsolete by the time the software is delivered.

While the debate may go on forever that which model is better, I believe that it depends upon the requirements of the individual, both models have their pros and cons. One must choose wisely! I hope this was an informative article for you. This was all that I had to talk about today. Since I’m very new to the topic, I might have missed something or made mistakes. Do suggest/correct me if you found something.