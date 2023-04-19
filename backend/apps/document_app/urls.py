from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.create_document, name="create_document"),
    path('boxlist/<int:box_id>/', views.get_box_documents, name='get_box_documents'),
    path('directorylist/<int:directory_id>/', views.get_directory_documents, name='get_directory_documents')
]
