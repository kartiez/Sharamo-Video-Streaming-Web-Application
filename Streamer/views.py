from django.shortcuts import render
from django.http import  HttpResponse
from django.http import JsonResponse
from collections import defaultdict
import shutil
from datetime import datetime
from django.core.files.storage import FileSystemStorage
import os 
import json, random
# Create your views here.

def hello(request):
    return render(request,'index.html')
def deletemovie(request):
    flag=0
    folder = "C:\\Users\\hp\\Documents\\django\\Movie_streamer\\static\\share"
    del_file = request.GET.get('filename')
    for filename in os.listdir(folder):
        if filename == del_file:
            try:
                os.unlink(folder+'\\'+filename)
                flag=1
            except Exception as e:
                print(e)
    if flag ==0:
        return HttpResponse("Failed: Bad username or password")
    else:
        return HttpResponse("Sucess: File has been deleted")

def getdiskspace(request):
    total, used, free = shutil.disk_usage("/")
    output = [
        {
            'Total' : total/1024,
            'Used' : used/1024,
            'Free' : free/1024
        }
    ]
    return JsonResponse(output,safe=False)

def getmovielist(request):
    d = []
    i=0
    opath = 'C:\\Users\\hp\\Documents\\django\\Movie_streamer\\static\\share'
    spath = ''
    data = os.listdir(opath)
    for f in data:
        tempsub = []
        templistsupersub = []
        if not os.path.isfile(os.path.join(opath, f)):
            subpath = opath+'\\'+f
            spath = f
            sub = os.listdir(subpath)
            for s in sub: 
                if not os.path.isfile(os.path.join(subpath,s)):
                    supersubpath = subpath+'\\'+s
                    sspath = spath+'\\'+s
                    supersub = os.listdir(supersubpath)
                    if len(supersub) == 0:
                        folder_temp = {
                        'type' : 'folder',
                        'name' : s,
                        'subdir' : []
                        }
                    for ss in supersub:
                        filetemp = {
                        'link' :  sspath+'\\'+ss,
                        'type': 'file',
                        'name':  ss,
                        'subdir': []
                        }
                        templistsupersub.append(filetemp)
                        folder_temp = {
                        'type' : 'folder',
                        'name' : s,
                        'subdir' : templistsupersub
                        }
                        
                        #print(supersubpath+'\\'+ss)
                    tempsub.append(folder_temp)
                    #d.append(temp5)
                    templistsupersub=[]
                    
                else:
                    tempfile = {
                        'link' : spath+'\\'+s,
                        'type': 'file',
                        'name': s,
                        'subdir': []
                            }
                    tempsub.append(tempfile)
            subfolder = {
                'type' : 'folder',
                'name' : f,
                'subdir' :  tempsub
            }      
            d.append(subfolder)  
           
            
        else:
            temp = {
                        'link' : f,
                        'type': 'file',
                        'name': f,
                        'subdir': []
                    }
            d.append(temp)
            #print(Opath+'\\'+f)
    i=i+1   
    return JsonResponse(d,safe=False)


def file_upload(request):
    if request.method == 'POST':
        myfile = request.FILES['file']
        fs = FileSystemStorage()
        fs.save(myfile.name, myfile)
    return HttpResponse("Sucess: File has been Uploaded")

def converttoMP4(filename):
    os.system("cd C:\\Users\\hp\\Documents\\django\\Movie_streamer\\static\\share")
    os.system('for i in *.mkv; do ffmpeg -i "$i" "${i%.*}.mp4"; done')
    return HttpResponse("Sucess: File has been Converted")
def write_json(data, filename='C:\\Users\\hp\\Documents\\django\\Movie_streamer\\static\\data.json'): 
        with open(filename,'w') as f: 
            json.dump(data, f, indent=4) 
def postcomments(request):
    jsonfile = 'C:\\Users\\hp\\Documents\\django\\Movie_streamer\\static\\data.json'
    with open(jsonfile) as json_file: 
        dt_string = datetime.now()
        data = json.load(json_file)
        new = { 'id' : data['total']['total'],
        'name' : request.GET.get('name'),
        'message' : request.GET.get('message'),
        'timestamp' :  str(dt_string)
         }
        data['total']['total'] +=1
        data['contents'].append(new)
    write_json(data)
    return HttpResponse("Done")
    
def getcomments(request):
    jsonfile = 'C:\\Users\\hp\\Documents\\django\\Movie_streamer\\static\\data.json'
    json_file = open(jsonfile)
    data = json.load(json_file)
    return JsonResponse(data['contents'],safe=False)
def deletecomments(request):
    jsonfile = 'C:\\Users\\hp\\Documents\\django\\Movie_streamer\\static\\data.json'
    item_id = request.GET.get('id')
    with open(jsonfile) as json_file: 
        data =json.load(json_file)
        contents = data['contents']
        i=0
        for element in contents:
            print(element)
            if element['id'] == int(item_id):
                break
            i+=1
        data['contents'].pop(i)
        write_json(data)
    return HttpResponse("Done")
                
