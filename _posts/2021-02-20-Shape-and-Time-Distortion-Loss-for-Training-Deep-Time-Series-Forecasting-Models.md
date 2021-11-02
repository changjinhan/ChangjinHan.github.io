---
title: "Shape and Time Distortion Loss for Training Deep Time Series Forecasting Models"
excerpt: 비정상성을 가진 시계열 데이터를 위한 새로운 Loss function 제안
header:
    teaser: "/assets/images/0008/limitation_of_mse.jpg"
use_math: true
toc: true
toc_sticky: true
toc_label: "페이지 목차"
categories: 
    - Paper Review
tags: 
    - Time Series
    - Loss Function
    - Dynamic Time Warping
date: 2021-02-20
---

Vincent Le Guen et al., [Shape and Time Distortion Loss for Training Deep Time Series Forecasting Models](https://arxiv.org/pdf/1909.09020.pdf), 2019  

## 들어가며
대부분의 시계열 예측은 MSE나 MAPE와 같이 예측 값과 실제 값의 차이를 정량적으로 평가하며 예측 모델을 만들고는 한다. 그러나 non-stationary 성질을 가진 데이터에 대해서 multi-step을 예측하는 경우에는 이런 방법이 최선은 아니다. 왜냐하면 loss가 원하는 수준으로 낮게 측정되더라도 예측 그래프의 경향성이 실제와 많이 다를 수 있기 때문이다. 이 논문에서는 그러한 경향성을 shape, temporal distortion 의 두 가지로 나누어 설명하고 이를 모두 고려하여 새로운 loss function을 제시하고 있다.  

### 핵심 요약
- Dynamic Time Warping(DTW)에 기반한 shape loss와 temporal loss를 정의하고 두 term을 합쳐 DILATE라는 새로운 loss function을 제시하였다.
- DTW loss가 미분 불가능하다는 성질을 극복하기 위해 smoothing 기법을 적용하였다.
- loss의 forward pass, backward pass를 customize해서 pytorch의 기본적인 자동 미분보다 빠른 속도로 계산을 할 수 있도록 코드를 짰다.  

## 문제 정의
급격한 변화가 나타나는 non-stationary 시계열 데이터에 대해서 multi-step 예측을 더 의미있게(informative) 해보자.  

![limitation of MSE](/assets/images/0008/limitation_of_mse.jpg){: .align-center}  
위의 그림에서 MSE loss의 한계를 확인할 수 있다.  

## 손실 함수
DILATE(DIstortion Loss including shApe and TimE)  

![DILATE](/assets/images/0008/dilate_loss.jpg){: .align-center}  
![shape loss](/assets/images/0008/shape_loss.jpg){: .align-center}  
![temporal loss](/assets/images/0008/temporal_loss.jpg){: .align-center}  

## 예측 성능
![forecasting result](/assets/images/0008/forecasting_result.jpg){: .align-center}  
10번의 반복실험을 통해 평균을 낸 결과이고, Student t-test($\alpha=0.05$)를 통해 best 성능을 bold로 표시하였다.  

![qualitative result](/assets/images/0008/qualitative_result.jpg){: .align-center}  
예측 그래프를 통한 정성적 평가는 위와 같다. DILATE를 적용한 Seq2Seq 모델의 경우 time delay 없이 shape을 정확하게 예측한 것을 볼 수 있다.

## 결론
시계열 예측은 통계적인 모델을 사용해 예측하던 시대부터 이어져 온 정말 오래된 분야인데 그동안 모델 학습에 사용할 수 있는 loss는 너무 한정적이었다. 그래서 시계열 예측 문제를 다루는 대부분의 논문에서는 모델이나 데이터에서 개선책을 찾으려고 노력했지만, 이 논문은 새로운 loss를 제안하고자 연구했다는 점이 새롭게 다가왔다. 나도 마침 시계열 예측 모델의 결과를 분석하면서 실제 target의 절대적인 값보다 경향성을 우선적으로 예측할 수 있는 모델을 만들 필요가 생겼는데 이 논문이 해결의 실마리가 될 수 있을 것 같다.
