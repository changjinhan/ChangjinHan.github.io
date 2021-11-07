---
title: "Stock Market Forecasting Using Computational Intelligence: A Survey"
excerpt: 주식 시장 예측 서베이 논문
header:
    teaser: "/assets/images/0003/forecasting.jpg"
    overlay_image: "/assets/images/0003/forecasting.jpg"
    overlay_filter: 0.5 # same as adding an opacity of 0.5 to a black background
    # caption: 
    actions:
        - url: "https://link.springer.com/article/10.1007/s11831-020-09413-5"
toc: true
toc_sticky: true
toc_label: "페이지 목차"
categories: 
    - Paper Review
tags: 
    - Finance
    - Stock Price Prediction
    - Survey
date: 2020-10-04
---
- 논문 링크: [https://link.springer.com/article/10.1007/s11831-020-09413-5](https://link.springer.com/article/10.1007/s11831-020-09413-5)


Finance 연구 분야에서 빼놓을 수 없는 게 바로 주식 시장을 예측하는 것이다. 미래의 주식 가격이나 가격의 방향성 등을 예측하고
거래량 상위 종목을 예측하기도 한다. 오랜 시간 동안 주목을 받아온 연구 주제이지만 주식 가격에 영향을 미치는 요인이 매우 많기 때문에
이로 인한 변동성이 예측을 힘들게 했으며 아직까지도 연구가 활발하게 이루어지도록 만들었다. 그러나 인공신경망을 도입한 연구들이 이 분야에서 등장하면서 이전의 통계적인 방법을 사용했던 연구 성과들을 뛰어넘고 있으며 예측의 가능성을 높이고 있는데 지금까지 어떤 알고리즘과 엔지니어링 테크닉들이 사용되었는지 살펴보자.

# Forecasting Work Flow
![forecasting](/assets/images/0003/forecasting.jpg){: .align-center}   
주식 시장 예측은 위와 같은 워크 플로우로 진행되며 각 단계에서 자주 사용되는 것들을 살펴보겠다.

## Input variable
먼저 입력 변수이다. 우리가 주식 시장을 예측하기 위해 피쳐로 사용할 데이터인데 크게 두 가지로 나뉜다. 첫째는 fundamental indicator이고, 두번째는 technical indicator이다. fundamental indicator는 회사의 크기, 자산, 부채, 수익, 손실, price-earning ratio(PER), 연례 레포트 등 회사에 대한 전반적인 금융 요소들을 일컫고 technical indicator는 주식 가격과 주식 가격에 산술연산을 가하여 얻을 수 있는 데이터이다. 즉, technical indicator에는 open price, close price, low price, high price 뿐만 아니라 moving average, momentum, rate of change, relative strength index 등이 포함된다.
연구마다 두 indicator 중 하나만 쓰기도 하고 두 개를 모두 섞어서 사용하기도 하는데 본 survey 논문의 저자들이 조사한 바에 따르면 아래와 같은 비율로 사용되었다고 한다.  
![input variables](/assets/images/0003/input_variables.jpg){: .align-center}   

## Data Pre-processing
예측 오차를 줄이고 아웃라이어를 제거하기 위한 테크닉이다. 주로 사용되는 기법은 transformation으로 데이터의 스케일을 바꾸는 작업이며 data normalization으로도 많이 알려져 있다. 이러한 normalization 방법도 다양하게 있지만, min-max normalization이 많이 사용된다.

## Feature Selection and Extraction
feature selection은 가장 최적화된 피쳐를 고르는 작업으로 stock market forecasting의 key issue라고 할 수 있다. 그리고 feature extraction은 고차원의 피쳐공간을 저차원의 피쳐공간으로 매핑하는 것을 포함하는 점에서 feature selection과 다르며 feature extraction의 장점은 원래 데이터셋의 숨겨진 정보가 발견될 수 있다는 것이다. 상관 관계, F-score, stepwise regression, PCA 등이 최적의 feature set을 고르기 위해 많이 사용되었다.

## Forecasting Models
예측 모델로는 ANN이 가장 많이 사용되었으며 단독으로 사용되기보다는 generalized autoregressive conditional heteroskedasticity(GARCH)와 같은 통계모델과 함께 사용되었다. 그러나 몇몇 연구는 SVM이 ANN보다 우수한 성능을 낸다고 말하기도 한다. 그리고 fuzzy logic과 Genetic Algorithm(GA)을 사용하여 모델의 예측 성능을 높이는 연구가 주류를 이루었다.  
다음은 주요 주식 거래소 데이터 예측에 사용된 모델 빈도를 나타낸다.
![CI approches frequency](/assets/images/0003/CI_approches_frequency.jpg){: .align-center}   

## Performance Evaluation
예측 성능을 측정하기 위한 지표는 다음과 같이 분류된다.
![Performance metrics](/assets/images/0003/performance_metrics.jpg){: .align-center}   

# 결론
본 서베이 논문을 요약하자면, 주식 시장을 예측하기 위해서는 technical indicator를 입력 변수로 사용하고 적절한 pre-processing과 feature selection을 거쳐서 예측 모델에 넣어주면 된다는 것이다. 그리고 평가지표는 워낙 다양하기 때문에 여러 평가지표의 조합을 사용해 모델을 평가해보고 계속 개선해나가야 한다.  

# TO STUDY
- Genetic Algorithm
- Google trend