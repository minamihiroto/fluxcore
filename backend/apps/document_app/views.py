from django.http import JsonResponse
from py2neo import Graph, Node, Relationship
from datetime import datetime
import os
from dotenv import load_dotenv
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import json

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
graph = Graph(os.environ.get('BOLT_URL'), auth=(
    os.environ.get('BOLT_USER'), os.environ.get('BOLT_PASSWORD')))


@api_view(['POST'])
@csrf_exempt
def create_document(request):
    data = json.loads(request.body)
    document_name = data.get("name")
    created_by = data.get("user_id")
    if data.get("box_id") or data.get("box_id") == 0:
        box_id = data.get("box_id")

        query = f"MATCH (b:Box) WHERE ID(b) = {box_id} RETURN b"
        box_data = graph.run(query).data()
        if not box_data:
            return JsonResponse({"error": "Box not found"})

        box_node = box_data[0]['b']

        document = Node("Document", name=document_name, created_by=created_by,
                        created_at=datetime.now(), updated_at=datetime.now())
        graph.create(document)

        child_rel = Relationship(box_node, "child", document)
        graph.create(child_rel)
        return JsonResponse({"status": "success"})
    if data.get("directory_id") or data.get("directory_id") == 0:
        directory_id = data.get("directory_id")

        query = f"MATCH (b:Directory) WHERE ID(b) = {directory_id} RETURN b"
        directory_data = graph.run(query).data()
        if not directory_data:
            return JsonResponse({"error": "Directory not found"})

        directory_node = directory_data[0]['b']

        document = Node("Document", name=document_name, created_by=created_by,
                        created_at=datetime.now(), updated_at=datetime.now())
        graph.create(document)

        child_rel = Relationship(directory_node, "child", document)
        graph.create(child_rel)
        return JsonResponse({"status": "success"})


@api_view(['GET'])
def get_box_documents(request, box_id):
    query = f"MATCH (b:Box)-[r:child]->(d:Document) WHERE ID(b) = {box_id} RETURN d"
    result = graph.run(query)
    documents = []

    for record in result:
        document = record['d']
        documents.append({
            "id": document.identity,
            "name": document['name'],
            "created_by": document['created_by'],
            "created_at": document["created_at"].isoformat(),
            "updated_at": document["updated_at"].isoformat(),
        })

    return JsonResponse({"documents": documents})


@api_view(['GET'])
def get_directory_documents(request, directory_id):
    query = f"MATCH (b:Directory)-[r:child]->(d:Document) WHERE ID(b) = {directory_id} RETURN d"
    result = graph.run(query)
    documents = []

    for record in result:
        document = record['d']
        documents.append({
            "id": document.identity,
            "name": document['name'],
            "created_by": document['created_by'],
            "created_at": document["created_at"].isoformat(),
            "updated_at": document["updated_at"].isoformat(),
        })

    return JsonResponse({"documents": documents})


def get_document_details(request, document_id):
    query = f"""
    MATCH (b:Document) WHERE ID(b) = {document_id}
    RETURN b, ID(b) as document_id;
    """
    result = graph.run(query).data()

    if not result:
        return JsonResponse({"error": "document not found"})

    document = result[0]['b']
    document_id = result[0]['document_id']

    serialized_document = {
        "id": document_id,
        "name": document["name"],
        "created_by": document["created_by"],
        "created_at": document["created_at"].isoformat(),
        "updated_at": document["updated_at"].isoformat(),
        "note": document["note"] if "note" in document else None
    }

    return JsonResponse({"document": serialized_document})


@api_view(['PATCH'])
@csrf_exempt
def update_document(request, document_id):
    data = json.loads(request.body)
    note = data.get("note")
    name = data.get("name")

    query = f"MATCH (d:Document) WHERE ID(d) = {document_id} RETURN d"
    document_data = graph.run(query).data()

    if not document_data:
        return JsonResponse({"error": "Document not found"})

    document_node = document_data[0]['d']

    if note is not None:
        document_node["note"] = note

    if name is not None:
        document_node["name"] = name

    document_node["updated_at"] = datetime.now()
    graph.push(document_node)

    serialized_document = {
        "id": document_id,
        "name": document_node["name"],
        "created_by": document_node["created_by"],
        "created_at": document_node["created_at"].isoformat(),
        "updated_at": document_node["updated_at"].isoformat(),
        "note": document_node.get("note", ""),
    }

    return JsonResponse({"document": serialized_document})
