import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsultaServices } from 'src/app/services/consulta';
import { Camera } from '@capacitor/camera';

@Component({
  selector: 'app-video-consulta',
  templateUrl: './video-consulta.page.html',
  styleUrls: ['./video-consulta.page.scss'],
  standalone: false
})
export class VideoConsultaPage implements OnInit, AfterViewInit {

  consultaId = '';
  consulta: any;
  carregando = true;
  tipoUsuario: 'usuario' | 'psicologo' = 'usuario';
  presencaConfirmada = false;

  @ViewChild('localVideo', { static: false })
  localVideo?: ElementRef<HTMLVideoElement>;

  @ViewChild('remoteVideo', { static: false })
  remoteVideo?: ElementRef<HTMLVideoElement>;

  localStream?: MediaStream;
  remoteStream?: MediaStream;
  chamadaIniciada = false;
  peerConnection!: RTCPeerConnection;
  isPsicologo = false;

  iceOferta: any[] = [];
  iceResposta: any[] = [];

  answerCriada = false;
  cameraLigada = true;
  microfoneLigado = true;
  candidatosRecebidos = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private consultaService: ConsultaServices
  ) {}


  ngAfterViewInit(){

  }


  async ngOnInit() {

    this.consultaId =
      this.route.snapshot.paramMap.get('id') || '';

    const usuario =
      localStorage.getItem('usuario');

    const psicologo =
      localStorage.getItem('psicologo');

    await this.solicitarPermissoes();

    if(usuario){

      this.tipoUsuario = 'usuario';
      this.isPsicologo = false;

    }else if(psicologo){

      this.tipoUsuario = 'psicologo';
      this.isPsicologo = true;

    }

    this.escutarConsulta();
  }



  escutarConsulta(){

    this.consultaService
      .escutarConsulta(this.consultaId)
      .subscribe(async (consulta: any) => {

        this.consulta = consulta;

        if(
          consulta.offer &&
          !consulta.answer &&
          !this.isPsicologo &&
          this.chamadaIniciada &&
          this.peerConnection &&
          !this.answerCriada
        ){
          this.answerCriada = true;

          await this.criarAnswer(
            consulta.offer
          );
        }

        if(
          consulta.answer &&
          this.isPsicologo &&
          this.peerConnection &&
          !this.peerConnection.currentRemoteDescription
        ){

          this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(
              consulta.answer
            )
          );

          console.log(
            'Answer recebida'
          );
        }

        if(
          consulta.iceCandidatesOferta &&
          !this.isPsicologo &&
          this.peerConnection &&
          this.peerConnection.remoteDescription
        ){

          for(const candidato of consulta.iceCandidatesOferta){

            const chave = JSON.stringify(candidato);

            if(this.candidatosRecebidos.has(chave)){
              continue;
            }

            this.candidatosRecebidos.add(chave);

            try{

              await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(candidato)
              );

            }catch(error){

              console.log(error);

            }
          }
        }

        if(
          consulta.iceCandidatesResposta &&
          this.isPsicologo &&
          this.peerConnection &&
          this.peerConnection.remoteDescription
        ){

          for(
            const candidato
            of consulta.iceCandidatesResposta
          ){

            try{

              await this.peerConnection
                .addIceCandidate(
                  new RTCIceCandidate(
                    candidato
                  )
                );

            }catch{}
          }
        }

        this.presencaConfirmada =

          this.tipoUsuario === 'usuario'
          ? consulta.checkinUsuario
          : consulta.checkinPsicologo;

        this.carregando = false;

      });
  }



  async confirmarPresenca(){

    let dados: any = {};

    if(this.tipoUsuario === 'usuario'){

      dados = {

        checkinUsuario: true,

        horaEntradaUsuario:
          new Date().toISOString()
      };

    }else{

      dados = {

        checkinPsicologo: true,

        horaEntradaPsicologo:
          new Date().toISOString()
      };
    }

    const sucesso =
      await this.consultaService
        .atualizarConsulta(
          this.consultaId,
          dados
        );

    if(sucesso){

      this.presencaConfirmada = true;

    }
  }


  async iniciarCamera(){

    try{

      this.localStream =
        await navigator.mediaDevices.getUserMedia({

          video: true,

          audio: true
        });

        if(this.localVideo){

          this.localVideo.nativeElement.srcObject =
          this.localStream;

        }

      }catch(error){

      console.log(
        'Erro ao acessar câmera:',
        error
      );
    }
  }



  get consultaLiberada(){

    return this.consulta?.checkinUsuario &&
           this.consulta?.checkinPsicologo;
  }



  async entrarNaSala() {

    if(this.chamadaIniciada){
      return;
    }

    try{

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,
          audio: true

        });

      this.localStream = stream;

      this.chamadaIniciada = true;

      setTimeout(async () => {

        if(this.localVideo?.nativeElement){

          this.localVideo.nativeElement.srcObject = stream;

          this.localVideo.nativeElement.muted = true;

          await this.localVideo.nativeElement.play();

          console.log('Vídeo local iniciado');
        }

      }, 500);

      if(this.localVideo?.nativeElement){

        this.localVideo.nativeElement.srcObject =
          stream;

        this.localVideo.nativeElement.muted = true;

        await this.localVideo.nativeElement.play();

        console.log('Vídeo local iniciado');
      }
      console.log(
        'Tracks vídeo:',
        stream.getVideoTracks().length
      );

      console.log(
        'Tracks áudio:',
        stream.getAudioTracks().length
      );

      this.iceOferta = [];
      this.iceResposta = [];

      this.criarPeerConnection();

        if(
          !this.isPsicologo &&
          this.consulta?.offer &&
          !this.consulta?.answer
        ){

          await this.criarAnswer(
            this.consulta.offer
          );
        }

      stream.getTracks().forEach(track => {

        this.peerConnection?.addTrack(
          track,
          stream
        );

      });

      console.log(
        'Sala iniciada:',
        this.consultaId
      );

      if(this.isPsicologo){

        await this.criarOffer();

      }

    }catch(error){

      console.log(
        'Erro ao abrir câmera:',
        error
      );
    }
  }



  async sairDaConsulta() {

    if(this.localStream){

      this.localStream
        .getTracks()
        .forEach(track => {

          track.stop();

        });
    }

    if(this.peerConnection){

      this.peerConnection.close();
    }

    if(this.localVideo?.nativeElement){

      this.localVideo.nativeElement.srcObject =
        null;
    }

    if(this.remoteVideo?.nativeElement){

      this.remoteVideo.nativeElement.srcObject =
        null;
    }

    this.chamadaIniciada = false;

    await this.consultaService.atualizarConsulta(
      this.consultaId,
      {
        offer: null,
        answer: null,
        iceCandidatesOferta: [],
        iceCandidatesResposta: []
      }
    );

    this.answerCriada = false;

    this.candidatosRecebidos.clear();
  }



  async solicitarPermissoes() {

    try {

      await Camera.requestPermissions();

    } catch(error) {
      console.log(error);
    }
  }



  criarPeerConnection(){

    const configuration = {

      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]
    };

    this.peerConnection =
      new RTCPeerConnection(configuration);

    this.peerConnection.ontrack = async (event) => {

      console.log(
        'Vídeo remoto recebido'
      );

      if(
        this.remoteVideo?.nativeElement
      ){

        this.remoteVideo.nativeElement.srcObject =
          event.streams[0];

          await this.remoteVideo.nativeElement.play();
      }
    };

    this.peerConnection.onconnectionstatechange =
      () => {

        console.log(
          'Estado:',
          this.peerConnection.connectionState
        );
      };

    this.peerConnection.onicecandidate = async (event) => {

      if(!event.candidate){
        return;
      }

      const candidato =
        event.candidate.toJSON();

      if(this.isPsicologo){

        this.iceOferta.push(
          candidato
        );

        await this.consultaService
          .salvarIceOferta(
            this.consultaId,
            this.iceOferta
          );

      }else{

        this.iceResposta.push(
          candidato
        );

        await this.consultaService
          .salvarIceResposta(
            this.consultaId,
            this.iceResposta
          );
      }
    };

    this.peerConnection.oniceconnectionstatechange =
    () => {

      console.log(
        'ICE:',
        this.peerConnection.iceConnectionState
      );

    };

    this.peerConnection.onicegatheringstatechange =
    () => {

      console.log(
        'ICE Gathering:',
        this.peerConnection.iceGatheringState
      );

    };
  }




  async criarOffer(){

    const offer =
      await this.peerConnection.createOffer();

    await this.peerConnection.setLocalDescription(
      offer
    );

    await this.consultaService.salvarOffer(
      this.consultaId,
      offer
    );

    console.log(
      'Offer enviada'
    );
  }



  async criarAnswer(offer: any){

    if(
      !this.peerConnection.currentRemoteDescription
    ){
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
    }

    const answer =
      await this.peerConnection.createAnswer();

    await this.peerConnection.setLocalDescription(
      answer
    );

    await this.consultaService.salvarAnswer(
      this.consultaId,
      answer
    );

    console.log(
      'Answer enviada'
    );
  }



  toggleCamera() {

    const videoTrack =
      this.localStream?.getVideoTracks()[0];

    if(!videoTrack){
      return;
    }

    videoTrack.enabled =
      !videoTrack.enabled;

    this.cameraLigada =
      videoTrack.enabled;

    console.log(
      'Câmera:',
      this.cameraLigada
    );
  }



  toggleMicrofone() {

    const audioTrack =
      this.localStream?.getAudioTracks()[0];

    if(!audioTrack){
      return;
    }

    audioTrack.enabled =
      !audioTrack.enabled;

    this.microfoneLigado =
      audioTrack.enabled;

    console.log(
      'Microfone:',
      this.microfoneLigado
    );
  }
}
