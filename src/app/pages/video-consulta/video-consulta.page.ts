import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsultaServices } from 'src/app/services/consulta';
import { Camera } from '@capacitor/camera';
import { AvalicaoServices } from 'src/app/services/avalicao';
import { Avaliacao } from 'src/app/services/avalicao';
import { FidelidadeServices } from 'src/app/services/fidelidade';
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

  cameraLigada = true;
  microfoneLigado = true;
  candidatosRecebidos = new Set<string>();
  remotoConectado = false;

  tempoDecorrido = '00:00';
  tempoRestante = '10:00';
  private timerInterval: any;
  encerrandoConsulta = false;

  aviso5MinutosExibido = false;
  avisoFinalizacao = false;
  mensagemAviso = '';

  avaliacao = 0;
  comentario = '';
  avaliacaoEnviada = false;
  heartbeatInterval: any;
  private consultaSubscription: any;
  participanteDesconectado = false;
  private answerEnviado = false;
  reconectando = false;
  icePendentes: RTCIceCandidateInit[] = [];
  pontosFidelidadeEntregues = false

  constructor(
    private route: ActivatedRoute,
    private consultaService: ConsultaServices,
    private avaliacaoService: AvalicaoServices,
    private fidelidadeServices: FidelidadeServices
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

    const avaliacaoExistente =
    await this.avaliacaoService.buscarMinhaAvaliacao(
      this.consultaId,
      this.tipoUsuario
    );

    if(avaliacaoExistente){
      this.avaliacaoEnviada = true;

      this.avaliacao =
      Number(avaliacaoExistente['nota']);

      this.comentario =
      avaliacaoExistente['comentario'];
    }

    this.escutarConsulta();
  }



  ngOnDestroy(){

    this.chamadaIniciada = false;

    clearInterval(this.timerInterval);

    clearInterval(this.heartbeatInterval);

    this.consultaSubscription?.unsubscribe();

    if(this.peerConnection){

      this.peerConnection.close();
    }

    if(this.localStream){

      this.localStream
        .getTracks()
        .forEach(track => track.stop());

    }

  }



  escutarConsulta(){


    this.consultaSubscription =
    this.consultaService
      .escutarConsulta(this.consultaId)
      .subscribe(async (consulta: any) => {

        const agora = Date.now();

        const ultimaAtividadeOutro =
          this.tipoUsuario === 'usuario'
            ? consulta.ultimaAtividadePsicologo
            : consulta.ultimaAtividadeUsuario;

        if(ultimaAtividadeOutro){

          const diferenca =
            agora - new Date(ultimaAtividadeOutro).getTime();

          if(diferenca > 7000){

            if(!this.participanteDesconectado){

              this.participanteDesconectado = true;

              this.remotoConectado = false;

              this.mostrarAviso(
                '⚠️ Participante desconectado.'
              );
            }
          }else{

            if(this.participanteDesconectado){

              this.participanteDesconectado = false;

              this.mensagemAviso = '';

              if(
                this.isPsicologo &&
                this.chamadaIniciada
              ){

                console.log('Participante voltou');

                await this.reiniciarConexao();
              }

              if(
                !this.isPsicologo &&
                this.chamadaIniciada
              ){

                console.log('Aguardando nova offer');

                this.answerEnviado = false;
              }
            }
          }
        }

        this.consulta = consulta;

        if(
          consulta.finalizada &&
          this.chamadaIniciada
        ){

          this.mostrarAviso(
            '✅ Consulta finalizada.'
          );

          await this.sairDaConsulta();
        }

        if(
          consulta.horaInicioConsulta &&
          !this.timerInterval
        ){
          this.iniciarCronometro();
        }

        if (!consulta.offer && !this.isPsicologo && this.chamadaIniciada) {
          console.log('Psicólogo limpou a consulta para reiniciar. Resetando usuário...');

          this.answerEnviado = false;
          this.candidatosRecebidos.clear();
          this.icePendentes = [];

          return;
        }

        if (
          consulta.offer &&
          !consulta.answer &&
          !this.isPsicologo &&
          this.chamadaIniciada &&
          !this.answerEnviado
        ) {
          if (this.peerConnection &&
            this.peerConnection.signalingState !== 'stable') {

              console.log('Recriando PeerConnection do usuário para nova tentativa');
            await this.reiniciarConexaoUsuario();
          }

          await this.criarAnswer(consulta.offer);

          this.answerEnviado = true;
        }


        if(
        consulta.answer &&
        this.isPsicologo &&
        this.peerConnection &&
        this.peerConnection.signalingState === 'have-local-offer'
        ){

          try{

            await this.peerConnection.setRemoteDescription(
              new RTCSessionDescription(
                consulta.answer
              )
            );

          }catch(error){

            console.log(error);

          }
        }

        if(
          consulta.iceCandidatesOferta &&
          !this.isPsicologo &&
          this.peerConnection
        ){

          for(const candidato of consulta.iceCandidatesOferta){

            const chave = JSON.stringify(candidato);

            if(this.candidatosRecebidos.has(chave)){
              continue;
            }

            this.candidatosRecebidos.add(chave);

            if(!this.peerConnection.remoteDescription){

              console.log(
                'ICE recebido antes da RemoteDescription'
              );

              this.icePendentes.push(candidato);

              continue;
            }

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

            const chave = JSON.stringify(candidato);

            if(this.candidatosRecebidos.has(chave)){
              continue;
            }

            this.candidatosRecebidos.add(chave);

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



  async reiniciarConexaoUsuario() {
  if (this.peerConnection) {
    this.peerConnection.close();
  }

  if (this.remoteVideo?.nativeElement) {
    this.remoteVideo.nativeElement.srcObject = null;
  }

  this.candidatosRecebidos.clear();
  this.icePendentes = [];
  this.iceOferta = [];
  this.iceResposta = [];
  this.remotoConectado = false;

  this.criarPeerConnection();

  this.localStream?.getTracks().forEach(track => {
    this.peerConnection.addTrack(track, this.localStream!);
  });
}



  async reiniciarConexao() {

    if(this.reconectando){
      return;
    }

    try{

      this.reconectando = true;

      this.answerEnviado = false;

      console.log('Reiniciando PeerConnection');

      if(this.peerConnection){
        this.peerConnection.close();
      }

      this.candidatosRecebidos.clear();

      this.iceOferta = [];
      this.iceResposta = [];

      if (this.remoteVideo?.nativeElement) {
        this.remoteVideo.nativeElement.srcObject = null;
      }

      this.criarPeerConnection();

      this.localStream?.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream!);
      });

      await this.consultaService.atualizarConsulta(
        this.consultaId,
        {
          offer: null,
          answer: null,
          iceCandidatesOferta: [],
          iceCandidatesResposta: []
        }
      );

      await this.criarOffer();

    }finally{

      this.reconectando = false;

    }
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

    if(!this.consultaSubscription){
      this.escutarConsulta();
    }

    if(this.chamadaIniciada){
      return;
    }
    this.remotoConectado = false;

    this.iniciarHeartbeat();

    try{

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,
          audio: true

        });

      this.localStream = stream;

      this.chamadaIniciada = true;

      if(!this.consulta?.horaInicioConsulta){

        await this.consultaService.atualizarConsulta(
          this.consultaId,
          {
            horaInicioConsulta:
              new Date().toISOString()
          }
        );

      }

      this.iniciarCronometro();

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


        stream.getTracks().forEach(track => {

          this.peerConnection?.addTrack(
            track,
            stream
          );

        });

        if(
          !this.isPsicologo &&
          this.consulta?.offer &&
          !this.consulta?.answer
        ){
          await this.criarAnswer(
            this.consulta.offer
          );
        }

      console.log(
        'Sala iniciada:',
        this.consultaId
      );

      if(this.isPsicologo){

      await this.consultaService.atualizarConsulta(
        this.consultaId,
        {
          offer: null,
          answer: null,
          iceCandidatesOferta: [],
          iceCandidatesResposta: []
        }
      );

      await this.criarOffer();
    }

    }catch(error){

      console.log(
        'Erro ao abrir câmera:',
        error
      );
    }
  }



  iniciarHeartbeat(){

    clearInterval(this.heartbeatInterval);

    this.heartbeatInterval =
      setInterval(async () => {

        if(this.tipoUsuario === 'usuario'){

          await this.consultaService
            .atualizarConsulta(
              this.consultaId,
              {
                ultimaAtividadeUsuario:
                  new Date().toISOString()
              }
            );

        }else{

          await this.consultaService
            .atualizarConsulta(
              this.consultaId,
              {
                ultimaAtividadePsicologo:
                  new Date().toISOString()
              }
            );

        }

      },2000);
  }



  async sairDaConsulta() {

    this.consultaSubscription?.unsubscribe();

    this.consultaSubscription = null;

    this.remotoConectado = false;

    clearInterval(this.timerInterval);

    clearInterval(this.heartbeatInterval);

    if(this.localStream){

      this.localStream
        .getTracks()
        .forEach(track => track.stop());

    }

    if(this.peerConnection){

      this.peerConnection.close();

      this.peerConnection = undefined as any;
    }

    if(this.localVideo?.nativeElement){

      this.localVideo.nativeElement.srcObject = null;
    }

    if(this.remoteVideo?.nativeElement){

      this.remoteVideo.nativeElement.srcObject = null;
    }

    this.chamadaIniciada = false;

    this.candidatosRecebidos.clear();

  }



  mostrarAviso(mensagem: string){
    this.mensagemAviso = mensagem;
  }



  async finalizarConsultaAutomatica() {

    const horaFim = new Date();

    const inicio =
      new Date(
        this.consulta.horaInicioConsulta
      );

    const duracao =
      Math.floor(
        (
          horaFim.getTime() -
          inicio.getTime()
        ) / 60000
      );

    const dadosFinalizacao: any = {

      finalizada: true,

      status: 'finalizada',

      horaFimConsulta:
        horaFim.toISOString(),

      duracaoReal:
        duracao,

      iceCandidatesOferta: [],

      iceCandidatesResposta: [],

      offer: null,

      answer: null
    };

    if(
      duracao >= 1 &&
      this.consulta.checkinUsuario
    ){

      dadosFinalizacao.presencaUsuario = true;

      dadosFinalizacao.horaSaidaUsuario =
        horaFim.toISOString();
    }

    if(
      duracao >= 1 &&
      this.consulta.checkinPsicologo
    ){

      dadosFinalizacao.presencaPsicologo = true;

      dadosFinalizacao.horaSaidaPsicologo =
        horaFim.toISOString();
    }

    if (
      this.isPsicologo &&
      !this.consulta.pontosFidelidadeEntregues &&
      dadosFinalizacao.presencaUsuario &&
      dadosFinalizacao.presencaPsicologo
    ) {

      await this.fidelidadeServices.adicionarPontos(
        this.consulta.usuarioId,
        100
      );

      dadosFinalizacao.pontosFidelidadeEntregues = true;

    }

    await this.consultaService.atualizarConsulta(
      this.consultaId,
      dadosFinalizacao
    );


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
        },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10
    };

    this.peerConnection =
      new RTCPeerConnection(configuration);

    this.peerConnection.ontrack = async (event) => {

      console.log('TRACK RECEBIDA');

      if(this.remoteVideo?.nativeElement){

        if(
          this.remoteVideo.nativeElement.srcObject !== event.streams[0]
        ){
          this.remoteVideo.nativeElement.srcObject =
            event.streams[0];
        }

        await this.remoteVideo.nativeElement
          .play()
          .catch(console.error);

        this.remotoConectado = true;
      }
    };

    this.peerConnection.onconnectionstatechange = async () => {

    const estado =
      this.peerConnection.connectionState;

    console.log('CONNECTION:', estado);

    if(estado === 'connected'){

      this.candidatosRecebidos.clear();

      this.mensagemAviso = '';

      this.remotoConectado = true;

    }

    else if(
      estado === 'failed'
    ){

      this.remotoConectado = false;

      this.mostrarAviso(
        '⚠️ Reconectando...'
      );

      if(this.isPsicologo){

        await this.reiniciarConexao();
      }
    }

    else if(estado === 'disconnected'){

      console.log(
        'Peer temporariamente desconectado'
      );

    }


    else if(estado === 'closed'){

      console.log(
        'PeerConnection encerrada'
      );
    }
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

    console.log('CRIANDO OFFER');

    if(
      !this.peerConnection ||
      this.peerConnection.signalingState !== 'stable'
    ){
      return;
    }

    const offer =
    await this.peerConnection.createOffer({
      iceRestart: true
    });

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



  async criarAnswer(offer:any){

    if(
      this.peerConnection.signalingState === 'closed'
    ){
      return;
    }

        if(
      this.peerConnection.signalingState !== 'stable'
    ){
      return;
    }

    console.log('CRIANDO ANSWER');

    try{

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      for(const candidato of this.icePendentes){

        try{

          await this.peerConnection.addIceCandidate(
            new RTCIceCandidate(candidato)
          );

        }catch(error){

          console.log(error);

        }
      }

      this.icePendentes = [];

    }catch(error){

      console.log(
        'Erro setRemoteDescription',
        error
      );

      return;
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
  }



  iniciarCronometro() {

    clearInterval(this.timerInterval);

    this.timerInterval = setInterval(async () => {

      if(!this.consulta?.horaInicioConsulta){
        return;
      }

      const inicio = new Date(
        this.consulta.horaInicioConsulta
      );

      const agora = new Date();

      const segundosPassados =
        Math.floor(
          (agora.getTime() -
          inicio.getTime()) / 1000
        );

      const duracaoTotal =
        (this.consulta?.duracaoConsulta || 10) * 60;

      const segundosRestantes =
        duracaoTotal - segundosPassados;

      const minutosRestantes = Math.floor(segundosRestantes / 60);

      if(
        minutosRestantes <= 2 &&
        !this.aviso5MinutosExibido
      ){

        this.aviso5MinutosExibido = true;

        this.mostrarAviso(
          '⚠️ A consulta será encerrada em 2 minutos.'
        );
      }

      if(segundosRestantes <= 0 && !this.encerrandoConsulta){

        this.encerrandoConsulta= true;

        clearInterval(this.timerInterval);

        this.avisoFinalizacao = true;

        this.mostrarAviso(
          '⏳ Consulta encerrando...'
        );

        setTimeout(async () => {

          await this.finalizarConsultaAutomatica();

        },6000);

        return;
      }

      const minutos =
        Math.floor(
          segundosRestantes / 60
        );

      const segundos =
        segundosRestantes % 60;

      this.tempoRestante =
        `${minutos
          .toString()
          .padStart(2,'0')}:${segundos
          .toString()
          .padStart(2,'0')}`;

    },1000);
  }



  async enviarAvaliacao(){

    if(this.avaliacao === 0){
      return;
    }

    if(this.avaliacaoEnviada){
      return;
    }

    const dados: Avaliacao = {

      consultaId: this.consultaId,

      usuarioId: this.consulta.usuarioId,
      usuarioNome: this.consulta.usuarioNome,

      psicologoId: this.consulta.psicologoId,
      psicologoNome: this.consulta.psicologoNome,

      avaliador: this.tipoUsuario,

      avaliado:
        this.tipoUsuario === 'usuario'
        ? 'psicologo'
        : 'usuario',

      nota: this.avaliacao,

      comentario: this.comentario,

      dataAvaliacao:
        new Date().toISOString()

    };

    const sucesso =
      await this.avaliacaoService.salvarAvaliacao(
        dados
      );

    if(sucesso){

      this.avaliacaoEnviada = true;

    }

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



  async toggleFullscreen() {

    const elemento =
      document.documentElement;

    if(!document.fullscreenElement){

      await elemento.requestFullscreen();

    }else{

      await document.exitFullscreen();

    }
  }
}
